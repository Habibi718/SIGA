import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeGrowthChart({ semesterScores }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const W = container.clientWidth;
    const H = 320;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d0f1a, 0.05);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
    camera.position.set(-4, 6, 12);
    camera.lookAt(3, 0, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x6c63ff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x00d4ff, 1.5, 30);
    pointLight.position.set(-2, 4, 4);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0x6c63ff, 1, 20);
    pointLight2.position.set(8, 3, -2);
    scene.add(pointLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x1e2340, 0x1a1e35);
    scene.add(gridHelper);

    // Data Map
    const semData = [
      { sem: "S1", score: semesterScores?.s1 || 38, color: "#4D96FF" },
      { sem: "S2", score: semesterScores?.s2 || 52, color: "#6C63FF" },
      { sem: "S3", score: semesterScores?.s3 || 64, color: "#9B59FF" },
      { sem: "S4", score: semesterScores?.s4 || 82, color: "#00D4FF" },
      { sem: "S5", score: semesterScores?.s5 || 89, color: "#FFD93D" },
      { sem: "S6", score: semesterScores?.s6 || 96, color: "#6BCB77" },
    ];

    const barGroup = new THREE.Group();
    const bars = [];
    const barWidth = 0.7;
    const spacing = 1.5;

    semData.forEach((d, i) => {
      const height = (d.score / 100) * 5;
      const x = i * spacing;

      // Bar
      const geo = new THREE.BoxGeometry(barWidth, height, barWidth);
      const mat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(d.color),
        shininess: 100,
        transparent: true,
        opacity: 0.92,
      });
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(x, height / 2, 0);
      bar.castShadow = true;
      bar.receiveShadow = true;
      barGroup.add(bar);
      bars.push({ mesh: bar, targetY: height / 2, targetHeight: height });

      // Cylinder Glow Top
      const topGeo = new THREE.CylinderGeometry(barWidth * 0.6, barWidth * 0.6, 0.12, 32);
      const topMat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(d.color),
        emissive: new THREE.Color(d.color),
        emissiveIntensity: 0.5,
      });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.set(x, height + 0.06, 0);
      barGroup.add(top);

      // Glow Line
      const glowGeo = new THREE.BoxGeometry(0.06, height, 0.06);
      const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(d.color), transparent: true, opacity: 0.3 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(x + barWidth / 2, height / 2, barWidth / 2);
      barGroup.add(glow);
    });

    // Connecting spline curve
    const curvePoints = semData.map((d, i) => new THREE.Vector3(i * spacing, (d.score / 100) * 5 + 0.3, 0));
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const curveGeo = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
    const curveMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 });
    const curveMesh = new THREE.Mesh(curveGeo, curveMat);
    barGroup.add(curveMesh);

    // Sphere dots
    curvePoints.forEach((pt) => {
      const sGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sMat = new THREE.MeshPhongMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.5 });
      const sphere = new THREE.Mesh(sGeo, sMat);
      sphere.position.copy(pt);
      barGroup.add(sphere);
    });

    barGroup.position.x = (-spacing * (semData.length - 1)) / 2;
    scene.add(barGroup);

    // Animate bars growing
    bars.forEach((b) => {
      b.mesh.scale.y = 0;
      b.mesh.position.y = 0;
    });

    let t = 0;
    let autoRotateAngle = 0;
    let frameId;

    function animate() {
      frameId = requestAnimationFrame(animate);
      t = Math.min(t + 0.025, 1);

      // Ease in
      const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1;
      bars.forEach((b) => {
        b.mesh.scale.y = ease;
        b.mesh.position.y = b.targetY * ease;
      });

      // Rotation
      autoRotateAngle += 0.003;
      barGroup.rotation.y = Math.sin(autoRotateAngle) * 0.4;

      // Pulse
      pointLight.intensity = 1.3 + Math.sin(Date.now() * 0.002) * 0.3;

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const W2 = container.clientWidth;
      renderer.setSize(W2, H);
      camera.aspect = W2 / H;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [semesterScores]);

  return <div ref={containerRef} style={{ width: "100%", height: "320px", borderRadius: "16px", overflow: "hidden" }} />;
}
