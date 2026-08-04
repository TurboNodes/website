import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { BORDERS_BASE64 } from "./globeBorders";
import { LAND_DOTS_BASE64 } from "./globeLandDots";
import {
  NODE_LOCATIONS,
  PROXY_HUBS,
  ROUTE_NODES,
  type LatLng,
  type ProxyHub,
} from "./networkGlobeData";

const RADIUS = 1.5;
/** Pitch clamp — standard globe tilt (~±60°), keeps poles from flipping. */
const MAX_PITCH = Math.PI / 3;

export type GlobeHoverHandler = (
  hub: ProxyHub | null,
  event?: ThreeEvent<PointerEvent>,
) => void;

function toPoint({ lat, lng }: LatLng, radius = RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function unpackCoordinates(source: string, radius: number) {
  const binary = atob(source);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const packed = new Int16Array(bytes.buffer);
  const positions = new Float32Array((packed.length / 2) * 3);

  for (let index = 0; index < packed.length; index += 2) {
    const point = toPoint(
      { lat: packed[index] / 100, lng: packed[index + 1] / 100 },
      radius,
    );
    positions.set([point.x, point.y, point.z], (index / 2) * 3);
  }
  return positions;
}

function makeArc(from: LatLng, to: LatLng, lift = 0.25) {
  const start = toPoint(from, RADIUS + 0.025);
  const end = toPoint(to, RADIUS + 0.025);
  const midpoint = start.clone().add(end).normalize();
  midpoint.multiplyScalar(RADIUS + start.distanceTo(end) * lift);
  return new THREE.QuadraticBezierCurve3(start, midpoint, end);
}

function closestHub(node: LatLng) {
  const nodePoint = toPoint(node, 1);
  return PROXY_HUBS.reduce((closest, hub) => {
    const distance = nodePoint.distanceToSquared(toPoint(hub, 1));
    const closestDistance = nodePoint.distanceToSquared(toPoint(closest, 1));
    return distance < closestDistance ? hub : closest;
  });
}

/** Chord length on the unit sphere — skip very long arcs that scrape continents. */
function chordDistance(a: LatLng, b: LatLng) {
  return toPoint(a, 1).distanceTo(toPoint(b, 1));
}

function DotLayer({
  positions,
  color,
  size,
  opacity = 1,
}: {
  positions: Float32Array;
  color: string;
  size: number;
  opacity?: number;
}) {
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
}

function RouteLine({
  points,
  color,
  opacity,
}: {
  points: THREE.Vector3[];
  color: string;
  opacity: number;
}) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    return new THREE.Line(geometry, material);
  }, [color, opacity, points]);

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );

  return <primitive object={line} />;
}

type PacketFlight = {
  curve: THREE.QuadraticBezierCurve3;
  /** Progress units per second (1 = full arc). */
  speed: number;
  phase: number;
  reverse: boolean;
};

function PacketTraffic({
  flights,
  reducedMotion,
  color,
  size,
  opacity = 0.95,
}: {
  flights: PacketFlight[];
  reducedMotion: boolean;
  color: string;
  size: number;
  opacity?: number;
}) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const positions = useMemo(
    () => new Float32Array(Math.max(flights.length, 1) * 3),
    [flights],
  );

  useFrame(({ clock }) => {
    if (reducedMotion || flights.length === 0 || !geometryRef.current) return;
    const time = clock.elapsedTime;
    for (let index = 0; index < flights.length; index++) {
      const flight = flights[index];
      let progress = (time * flight.speed + flight.phase) % 1;
      if (flight.reverse) progress = 1 - progress;
      // Ease ends so packets linger briefly at servers.
      const eased =
        progress < 0.08
          ? progress * progress * 12.5
          : progress > 0.92
            ? 1 - (1 - progress) * (1 - progress) * 12.5
            : progress;
      flight.curve.getPoint(Math.min(1, Math.max(0, eased)), scratch);
      positions[index * 3] = scratch.x;
      positions[index * 3 + 1] = scratch.y;
      positions[index * 3 + 2] = scratch.z;
    }
    const attribute = geometryRef.current.getAttribute("position");
    attribute.needsUpdate = true;
  });

  if (reducedMotion || flights.length === 0) return null;

  return (
    <points>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function buildPacketFlights(
  curves: THREE.QuadraticBezierCurve3[],
  {
    perCurve,
    baseSpeed,
    bothWays,
  }: { perCurve: number; baseSpeed: number; bothWays: boolean },
) {
  const flights: PacketFlight[] = [];
  curves.forEach((curve, curveIndex) => {
    for (let packet = 0; packet < perCurve; packet++) {
      flights.push({
        curve,
        speed: baseSpeed * (0.85 + ((curveIndex + packet) % 5) * 0.06),
        phase: (packet + curveIndex * 0.37) / perCurve,
        reverse: false,
      });
      if (bothWays) {
        flights.push({
          curve,
          speed: baseSpeed * (0.8 + ((curveIndex + packet) % 4) * 0.07),
          phase: (packet + 0.5 + curveIndex * 0.19) / perCurve,
          reverse: true,
        });
      }
    }
  });
  return flights;
}

function HubMarker({
  hub,
  active,
  onHover,
}: {
  hub: ProxyHub;
  active: boolean;
  onHover: GlobeHoverHandler;
}) {
  const pulse = useRef<THREE.Mesh>(null);
  const position = useMemo(() => toPoint(hub, RADIUS + 0.045), [hub]);

  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const wave = 1 + Math.sin(clock.elapsedTime * 2.4 + hub.lat) * 0.12;
    pulse.current.scale.setScalar(active ? wave * 1.35 : wave);
  });

  return (
    <group position={position}>
      <mesh
        onPointerEnter={(event) => {
          event.stopPropagation();
          onHover(hub, event);
        }}
        onPointerMove={(event) => {
          event.stopPropagation();
          onHover(hub, event);
        }}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.12, 18, 18]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.045, 20, 20]} />
        <meshBasicMaterial color="#1a4fd6" />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshBasicMaterial
          color="#4778f2"
          transparent
          opacity={active ? 0.28 : 0.14}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function NetworkGlobeScene({
  reducedMotion,
  hoveredHub,
  onHover,
}: {
  reducedMotion: boolean;
  hoveredHub: ProxyHub["id"] | null;
  onHover: GlobeHoverHandler;
}) {
  const globe = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, x: 0, y: 0, pointerId: -1 });
  const rotation = useRef({ x: 0.16, y: -1.65 });
  const { gl } = useThree();

  const land = useMemo(
    () => unpackCoordinates(LAND_DOTS_BASE64, RADIUS + 0.008),
    [],
  );
  const borders = useMemo(
    () => unpackCoordinates(BORDERS_BASE64, RADIUS + 0.012),
    [],
  );
  const nodes = useMemo(() => {
    const positions = new Float32Array(NODE_LOCATIONS.length * 3);
    NODE_LOCATIONS.forEach((node, index) => {
      const point = toPoint(node, RADIUS + 0.028);
      positions.set([point.x, point.y, point.z], index * 3);
    });
    return positions;
  }, []);

  const routes = useMemo(() => {
    const regionalCurves = ROUTE_NODES.filter(
      (node) => chordDistance(node, closestHub(node)) < 0.85,
    ).map((node) => makeArc(node, closestHub(node)));
    const backboneCurves = [
      makeArc(PROXY_HUBS[0], PROXY_HUBS[1], 0.34),
      makeArc(PROXY_HUBS[1], PROXY_HUBS[2], 0.34),
      // Skip US↔SG — the Pacific chord scrapes oddly across the globe.
    ];
    return {
      regional: regionalCurves.map((curve) => curve.getPoints(28)),
      backbone: backboneCurves.map((curve) => curve.getPoints(48)),
      regionalCurves,
      backboneCurves,
    };
  }, []);

  const packets = useMemo(() => {
    const backbone = buildPacketFlights(routes.backboneCurves, {
      perCurve: 5,
      baseSpeed: 0.22,
      bothWays: true,
    });
    // Sparse edge traffic so the scene stays readable.
    const regionalCurves = routes.regionalCurves.filter(
      (_, index) => index % 4 === 0,
    );
    const regional = buildPacketFlights(regionalCurves, {
      perCurve: 1,
      baseSpeed: 0.16,
      bothWays: true,
    });
    // Soft trails sit a beat behind each packet.
    const trails = [...backbone, ...regional].map((flight) => ({
      ...flight,
      phase: flight.phase - 0.035 * (flight.reverse ? -1 : 1),
    }));
    return { backbone, regional, trails };
  }, [routes]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onMove = (event: PointerEvent) => {
      if (!drag.current.active) return;
      rotation.current.y += (event.clientX - drag.current.x) * 0.006;
      rotation.current.x = THREE.MathUtils.clamp(
        rotation.current.x + (event.clientY - drag.current.y) * 0.004,
        -MAX_PITCH,
        MAX_PITCH,
      );
      drag.current.x = event.clientX;
      drag.current.y = event.clientY;
    };

    const onUp = (event: PointerEvent) => {
      if (!drag.current.active) return;
      if (
        drag.current.pointerId !== -1 &&
        event.pointerId !== drag.current.pointerId
      ) {
        return;
      }
      drag.current.active = false;
      drag.current.pointerId = -1;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!drag.current.active && !reducedMotion) {
      rotation.current.y += Math.min(delta, 0.05) * 0.08;
    }
    globe.current?.rotation.set(
      rotation.current.x,
      rotation.current.y,
      -0.1,
    );
  });

  const startDrag = (event: ThreeEvent<PointerEvent>) => {
    if (event.nativeEvent.pointerType === "touch") return;
    event.stopPropagation();
    const { pointerId, clientX, clientY } = event.nativeEvent;
    drag.current = {
      active: true,
      x: clientX,
      y: clientY,
      pointerId,
    };
    gl.domElement.setPointerCapture(pointerId);
    onHover(null);
  };

  return (
    <group ref={globe}>
      <mesh onPointerDown={startDrag}>
        <sphereGeometry args={[RADIUS, 72, 72]} />
        <meshPhysicalMaterial
          color="#edf2f8"
          roughness={0.72}
          metalness={0.02}
          clearcoat={0.32}
          clearcoatRoughness={0.65}
        />
      </mesh>

      <DotLayer positions={land} color="#435068" size={0.014} opacity={0.72} />
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[borders, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#273650"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </lineSegments>
      <DotLayer positions={nodes} color="#5b86f0" size={0.055} opacity={0.22} />
      <DotLayer positions={nodes} color="#2f6aef" size={0.022} opacity={0.92} />

      {routes.regional.map((points, index) => (
        <RouteLine
          key={`route-${index}`}
          points={points}
          color="#4778e8"
          opacity={0.14}
        />
      ))}
      {routes.backbone.map((points, index) => (
        <RouteLine
          key={`backbone-${index}`}
          points={points}
          color="#1a4fd6"
          opacity={0.52}
        />
      ))}

      <PacketTraffic
        flights={packets.trails}
        reducedMotion={reducedMotion}
        color="#8eb6ff"
        size={0.028}
        opacity={0.35}
      />
      <PacketTraffic
        flights={packets.regional}
        reducedMotion={reducedMotion}
        color="#6b9af5"
        size={0.038}
        opacity={0.75}
      />
      <PacketTraffic
        flights={packets.backbone}
        reducedMotion={reducedMotion}
        color="#1a4fd6"
        size={0.055}
        opacity={0.95}
      />

      {PROXY_HUBS.map((hub) => (
        <HubMarker
          key={hub.id}
          hub={hub}
          active={hoveredHub === hub.id}
          onHover={onHover}
        />
      ))}
    </group>
  );
}
