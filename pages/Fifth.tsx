"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Canvas,
  type ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { ContactShadows, OrthographicCamera } from "@react-three/drei";
import { WordRotate } from "@/components/ui/word-rotate";
import { ArrowRight, Globe, Link2, MessageCircleMore } from "lucide-react";
import { ExtrudeGeometry, Group, Vector3 } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LOGO_SVG = `
<svg width="156" height="54" viewBox="0 0 156 54" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M155.247 13.5C155.247 20.9558 149.203 27 141.747 27H114.749C107.293 27 101.249 33.0439 101.249 40.4995C101.249 47.9551 95.2051 53.999 87.7495 53.999H13.5C6.04416 53.999 0 47.9549 0 40.499C0 33.0432 6.04416 26.999 13.5 26.999H47.2485C54.7041 26.999 60.748 20.9551 60.748 13.4995C60.748 6.04394 66.792 0 74.2476 0H141.747C149.203 0 155.247 6.04416 155.247 13.5Z" fill="#0F0B0A"/>
</svg>
`;

const WHAT_WE_DO = [
  "World-Class Digital",
  "Collaborate Success",
  "Full-Bunch Fridays",
  "Unlock Potential",
  "Outstanding Service",
  "Celebrate Success",
  "Exceed Expectations",
  "Expect Creativity",
  "Obsess Over Detail",
  "Embrace Change",
  "High-Five",
  "Value Relationships",
  "Party",
];

const WHAT_WE_DONT = [
  "Work Weekends",
  "Resist Change",
  '"Make It Pop"',
  "Sacrifice Quality For Profit",
  "Overpromise",
  "Accept Mediocrity",
  "Outsource",
  "Lose At Mario Kart",
  "Free Pitches",
  "Egos",
  "Cut Corners",
  "Deal",
];

const SOCIALS = [
  { label: "Website", href: "https://hylith.com", icon: Globe },
  { label: "Behance", href: "https://www.behance.net", icon: Link2 },
  {
    label: "Contact",
    href: "https://www.linkedin.com",
    icon: MessageCircleMore,
  },
];

const PIECE_COUNT = 18;

type PieceState = {
  angularVelocity: number;
  halfHeight: number;
  radius: number;
  rotation: number;
  scale: number;
  tiltX: number;
  tiltY: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
  z: number;
};

type DragState = {
  index: number;
  lastX: number;
  lastY: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
};

function createLogoGeometry() {
  const loader = new SVGLoader();
  const parsed = loader.parse(LOGO_SVG);
  const shapes = parsed.paths.flatMap((path) => path.toShapes(true));

  const geometry = new ExtrudeGeometry(shapes, {
    bevelEnabled: false,
    curveSegments: 18,
    depth: 8,
  });

  geometry.center();
  geometry.rotateX(Math.PI);
  geometry.scale(0.012, 0.012, 0.012);
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  const size = box
    ? new Vector3().subVectors(box.max, box.min)
    : new Vector3(1.85, 0.65, 0.16);

  return { geometry, size };
}

function createPieceStates(width: number, height: number, size: Vector3) {
  const pieceCount = PIECE_COUNT;
  const left = -width / 2 + 0.95;
  const right = width / 2 - 0.95;
  const spread = right - left;

  return Array.from({ length: pieceCount }, (_, index) => {
    const t = index / Math.max(pieceCount - 1, 1);
    const seed = Math.abs(Math.sin(index * 87.43) * 10000);
    const noise = seed - Math.floor(seed);
    const scale = 0.58 + noise * 0.34;
    const visualWidth = size.x * scale;
    const visualHeight = size.y * scale;

    return {
      angularVelocity: (noise - 0.5) * 2.1,
      halfHeight: visualHeight / 2,
      radius: Math.max(visualWidth * 0.28, visualHeight * 0.95),
      rotation: (noise - 0.5) * 1.8,
      scale,
      tiltX: (0.5 - noise) * 0.2,
      tiltY: (noise - 0.5) * 0.18,
      vx: (noise - 0.5) * 1.4,
      vy: -0.25 - (index % 4) * 0.08,
      x: left + spread * t + (noise - 0.5) * 1.75,
      y: height * 0.38 + (index % 5) * 0.8 + noise * 1.6,
      z: (index % 3) * 0.14,
    };
  });
}

function LogoField({ active }: { active: boolean }) {
  const { viewport } = useThree();
  const pieceRefs = useRef<(Group | null)[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const piecesRef = useRef<PieceState[]>([]);
  const { geometry, size } = useMemo(() => createLogoGeometry(), []);
  const floorY = -viewport.height * 0.24;
  const leftLimit = -viewport.width / 2 + 0.9;
  const rightLimit = viewport.width / 2 - 0.9;

  useEffect(() => {
    piecesRef.current = createPieceStates(
      viewport.width,
      viewport.height,
      size,
    );
  }, [active, size, viewport.height, viewport.width]);

  useEffect(() => {
    const handlePointerUp = () => {
      const drag = dragRef.current;

      if (!drag) {
        return;
      }

      const piece = piecesRef.current[drag.index];

      if (piece) {
        piece.vx = drag.velocityX * 0.18;
        piece.vy = drag.velocityY * 0.18;
        piece.angularVelocity += drag.velocityX * 0.01;
      }

      dragRef.current = null;
      document.body.style.cursor = "auto";
    };

    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "auto";
    };
  }, []);

  useFrame((state, delta) => {
    const pieces = piecesRef.current;

    if (!pieces.length) {
      return;
    }

    const dt = Math.min(delta, 0.03);
    const pointerX = state.pointer.x * (viewport.width / 2);
    const pointerY = state.pointer.y * (viewport.height / 2);

    for (let index = 0; index < pieces.length; index += 1) {
      const piece = pieces[index];
      const group = pieceRefs.current[index];

      if (!group) {
        continue;
      }

      if (!active) {
        group.visible = false;
        continue;
      }

      group.visible = true;

      const drag = dragRef.current;

      if (drag?.index === index) {
        const nextX = Math.min(
          rightLimit - piece.radius,
          Math.max(leftLimit + piece.radius, pointerX + drag.offsetX),
        );
        const nextY = Math.max(
          floorY + piece.halfHeight,
          pointerY + drag.offsetY,
        );

        drag.velocityX = (nextX - drag.lastX) / Math.max(dt, 0.016);
        drag.velocityY = (nextY - drag.lastY) / Math.max(dt, 0.016);
        drag.lastX = nextX;
        drag.lastY = nextY;

        piece.x = nextX;
        piece.y = nextY;
        piece.vx = 0;
        piece.vy = 0;
        piece.rotation += piece.angularVelocity * dt;
        piece.tiltX += (-drag.velocityY * 0.006 - piece.tiltX) * 0.14;
        piece.tiltY += (drag.velocityX * 0.006 - piece.tiltY) * 0.14;

        continue;
      }

      piece.vy -= 15.5 * dt;
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.rotation += piece.angularVelocity * dt;
      piece.tiltX += (-piece.vy * 0.03 - piece.tiltX) * 0.1;
      piece.tiltY += (piece.vx * 0.04 - piece.tiltY) * 0.1;

      if (piece.x < leftLimit + piece.radius) {
        piece.x = leftLimit + piece.radius;
        piece.vx *= -0.55;
      }

      if (piece.x > rightLimit - piece.radius) {
        piece.x = rightLimit - piece.radius;
        piece.vx *= -0.55;
      }

      const floorLimit = floorY + piece.halfHeight;

      if (piece.y < floorLimit) {
        piece.y = floorLimit;
        piece.vy *= -0.34;
        piece.vx *= 0.93;
        piece.angularVelocity *= 0.9;

        if (Math.abs(piece.vy) < 0.12) {
          piece.vy = 0;
        }
      }
    }

    for (let firstIndex = 0; firstIndex < pieces.length; firstIndex += 1) {
      const first = pieces[firstIndex];

      for (
        let secondIndex = firstIndex + 1;
        secondIndex < pieces.length;
        secondIndex += 1
      ) {
        const second = pieces[secondIndex];
        const dx = second.x - first.x || 0.001;
        const dy = second.y - first.y || 0.001;
        const distance = Math.hypot(dx, dy);
        const minimumDistance = first.radius + second.radius;

        if (distance >= minimumDistance) {
          continue;
        }

        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = minimumDistance - distance;
        const firstDragged = dragRef.current?.index === firstIndex;
        const secondDragged = dragRef.current?.index === secondIndex;
        const firstWeight = firstDragged ? 0 : 0.5;
        const secondWeight = secondDragged ? 0 : 0.5;

        first.x -= nx * overlap * firstWeight;
        first.y -= ny * overlap * firstWeight;
        second.x += nx * overlap * secondWeight;
        second.y += ny * overlap * secondWeight;

        const impactVelocity =
          (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;

        if (impactVelocity < 0) {
          const impulse = -impactVelocity * 0.3;

          if (!firstDragged) {
            first.vx -= nx * impulse;
            first.vy -= ny * impulse;
          }

          if (!secondDragged) {
            second.vx += nx * impulse;
            second.vy += ny * impulse;
          }
        }
      }
    }

    for (let index = 0; index < pieces.length; index += 1) {
      const piece = pieces[index];
      const group = pieceRefs.current[index];

      if (!group) {
        continue;
      }

      group.position.set(piece.x, piece.y, piece.z);
      group.rotation.set(piece.tiltX, piece.tiltY, piece.rotation);
      group.scale.setScalar(piece.scale);
    }
  });

  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight intensity={2.2} position={[0, 8, 10]} />
      <directionalLight intensity={0.7} position={[-8, 4, 8]} />

      {Array.from({ length: PIECE_COUNT }, (_, index) => (
        <group
          key={index}
          ref={(node) => {
            pieceRefs.current[index] = node;
          }}
          onPointerDown={(event: ThreeEvent<PointerEvent>) => {
            if (!active) {
              return;
            }

            event.stopPropagation();

            const piece = piecesRef.current[index];

            if (!piece) {
              return;
            }

            dragRef.current = {
              index,
              lastX: piece.x,
              lastY: piece.y,
              offsetX: piece.x - event.point.x,
              offsetY: piece.y - event.point.y,
              velocityX: 0,
              velocityY: 0,
            };

            piece.vx = 0;
            piece.vy = 0;
            document.body.style.cursor = "grabbing";
          }}
          onPointerOut={() => {
            if (!dragRef.current) {
              document.body.style.cursor = "auto";
            }
          }}
          onPointerOver={() => {
            if (active && !dragRef.current) {
              document.body.style.cursor = "grab";
            }
          }}
        >
          <mesh castShadow geometry={geometry}>
            <meshStandardMaterial
              color="#0F0B0A"
              metalness={0.08}
              roughness={0.42}
            />
          </mesh>
        </group>
      ))}

      <ContactShadows
        blur={2.5}
        color="#0F0B0A"
        frames={1}
        opacity={0.22}
        position={[0, floorY - 0.3, 0]}
        scale={viewport.width * 0.86}
      />
    </>
  );
}

function ValueColumn({ items, title }: { items: string[]; title: string }) {
  const splitIndex = Math.ceil(items.length / 2);
  const firstGroup = items.slice(0, splitIndex);
  const secondGroup = items.slice(splitIndex);

  return (
    <div className="py-10">
      <p className="text-2xl font-medium tracking-[-0.03em] text-[#0F0B0A]">
        {title}
      </p>

      <div className="mt-5 grid grid-cols-2 tracking-[-0.03em] font-medium gap-x-6 gap-y-2 text-xl leading-6 text-[#0F0B0A]/58 md:gap-x-10">
        <ul className="space-y-1">
          {firstGroup.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <ul className="space-y-1">
          {secondGroup.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const Fifth = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [physicsActive, setPhysicsActive] = useState(false);

  useGSAP(
    () => {
      if (!lineRef.current || !footerRef.current || !stageRef.current) {
        return;
      }

      setPhysicsActive(false);

      gsap.set(footerRef.current, {
        autoAlpha: 1,
        yPercent: 115,
      });

      gsap.set(lineRef.current, {
        autoAlpha: 0,
        scaleX: 0,
        transformOrigin: "center center",
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top bottom-=80",
          toggleActions: "play none none reverse",
          onLeaveBack: () => setPhysicsActive(false),
        },
      });

      timeline.to(footerRef.current, {
        duration: 1,
        ease: "power4.out",
        yPercent: 0,
      });

      timeline.to(
        lineRef.current,
        {
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          onComplete: () => setPhysicsActive(true),
          onReverseComplete: () => setPhysicsActive(false),
          scaleX: 1,
        },
        "-=0.2",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#EFEFED] text-[#0F0B0A]"
    >
      <div className="mx-auto flex w-full max-w-[1340px] flex-col px-6 pb-6  md:px-8  lg:px-10">
        <div className="w-full">
          <h2 className="w-full text-[clamp(2.35rem,5vw,5.1rem)] leading-[0.98] tracking-[-0.01em]">
            Above All, We Believe In Human Relationships, Exceptional Outcomes,
            And Having Fun Along The Way.
          </h2>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2  lg:gap-16">
          <ValueColumn items={WHAT_WE_DO} title="What We Do" />
          <ValueColumn items={WHAT_WE_DONT} title="What We Don't" />
        </div>

        <button className="mt-12 inline-flex w-fit cursor-pointer  flex-col items-start  text-left text-[1rem] font-medium tracking-[-0.04em] md:text-[1.2rem]">
          <span className="inline-flex items-center text-4xl gap-2">
            Let&apos;s Make
            <ArrowRight className="size-10  md:size-10" />
          </span>
          <span className="flex items-center text-4xl gap-2">
            Something{" "}
            <WordRotate
              words={[
                "Click",
                "Epic",
                "Fun",
                "Delightful",
                "Beautiful",
                "Extraordinary",
              ]}
            />
          </span>
        </button>

        <div ref={stageRef} className="relative mt-16 h-[24rem] md:h-[29rem]">
          <div className="absolute inset-0 z-10">
            <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
              <Suspense fallback={null}>
                <OrthographicCamera
                  makeDefault
                  position={[0, 0, 30]}
                  zoom={35}
                />
                <LogoField active={physicsActive} />
              </Suspense>
            </Canvas>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-[7.75rem] z-20 md:bottom-[8.75rem]">
            <div
              ref={lineRef}
              className="h-[4px] scale-x-0 rounded-full bg-[#0F0B0A] opacity-0"
            />
          </div>

          <footer
            ref={footerRef}
            className="absolute inset-x-0 bottom-0 z-30 translate-y-full rounded-[26px] bg-[#0F0B0A] px-6 py-6 text-[#EFEFED] opacity-0 shadow-[0_24px_70px_rgba(15,11,10,0.22)] md:px-8 md:py-7"
          >
            <div className="flex min-h-[8.5rem] flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="flex items-start">
                <Image
                  alt="Hylith logo"
                  className="h-auto w-[3.4rem] brightness-0 invert"
                  height={54}
                  priority={false}
                  src="/assets/logo.svg"
                  width={156}
                />
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                <div className="flex items-center gap-3 text-[#EFEFED]/72">
                  {SOCIALS.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      aria-label={label}
                      className="transition-transform duration-300 hover:-translate-y-0.5"
                      href={href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon className="size-[0.92rem]" strokeWidth={1.7} />
                    </a>
                  ))}
                  <a
                    className="ml-3 text-[0.76rem] tracking-[0.02em] text-[#EFEFED]/58"
                    href="mailto:hello@hylith.com"
                  >
                    hello@hylith.com
                  </a>
                </div>

                <div className="text-[0.72rem] tracking-[0.02em] text-[#EFEFED]/52">
                  <p>© Hylith 2026</p>
                  <p>Privacy | Terms And Conditions</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default Fifth;
