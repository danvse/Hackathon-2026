import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ComponentInfo {
  id: string;
  name: string;
  category: string;
  system: string;
  icon: string;
  badge: string;
  tagline: string;
  description: string;
  lifespan: string;
  symptoms: string[];
  oemVsAftermarket: string;
  priceRange: string;
  diyDifficulty: 'Easy' | 'Moderate' | 'Advanced';
  tools: string[];
}

export const COMPONENT_KNOWLEDGE_BASE: Record<string, ComponentInfo> = {
  'Brake Rotors': {
    id: 'Brake Rotors',
    name: 'Front & Rear Brake Rotors',
    category: 'Brake Rotors',
    system: 'Braking & Safety',
    icon: '🛑',
    badge: 'High-Wear Friction Element',
    tagline: 'Precision cast-iron disc providing the friction surface for stopping power.',
    description:
      'Brake rotors are circular heavy metal discs bolted to your wheel hubs. When you step on the brake pedal, the calipers clamp the brake pads tightly against both sides of the spinning rotor to convert kinetic motion into thermal heat via friction.',
    lifespan: '50,000 – 70,000 miles (Replace in pairs per axle)',
    symptoms: [
      'Steering wheel shudders or pulses when applying brakes at highway speeds (rotor runout/warping)',
      'High-pitched squeal or metal-on-metal grinding noise',
      'Visible deep grooves, scoring lines, or blue heat discoloration on the disc face',
      'Thickness measured below the stamped minimum discarding thickness (Min TH)',
    ],
    oemVsAftermarket:
      'Quality aftermarket coated rotors (e.g., Zimmermann Coat-Z, Brembo, Centric) often outperform budget OEM by preventing hub rust. Cross-drilled rotors run cooler in spirited driving.',
    priceRange: '$45.00 – $145.00 per rotor',
    diyDifficulty: 'Moderate',
    tools: ['T30 Torx bit (retaining screw)', '17mm/19mm Socket', 'Brake cleaner', 'Wire brush', 'Torque wrench'],
  },
  'Brake Pads': {
    id: 'Brake Pads',
    name: 'Ceramic / Semi-Metallic Brake Pads',
    category: 'Brake Pads',
    system: 'Braking & Safety',
    icon: '🛑',
    badge: 'Primary Wear Contact',
    tagline: 'Friction lining pressed against the rotor to safely decelerate the car.',
    description:
      'Brake pads consist of a heavy steel backing plate with high-temperature friction material bonded to its face. As pads wear down with each stop, acoustic wear indicators (screech clips) or electronic wear sensors notify the driver before metal contacts metal.',
    lifespan: '30,000 – 50,000 miles (Front pads wear 2x faster than rear)',
    symptoms: [
      'High-pitched screeching when braking gently',
      'Dashboard "Brake Wear" warning indicator light on European/luxury cars',
      'Spongy pedal travel or longer stopping distance required',
      'Friction lining thickness measured under 3mm (safe limit)',
    ],
    oemVsAftermarket:
      'Aftermarket Ceramic pads (Akebono ProACT, Bosch QuietCast) produce up to 80% less black brake dust than German factory semi-metallic pads while maintaining smooth bite.',
    priceRange: '$35.00 – $85.00 per axle set',
    diyDifficulty: 'Easy',
    tools: ['C-Clamp or Caliper Piston Compressor', '13mm/15mm Wrenches', 'Brake Lube (Sil-Glyde)', 'Brake Cleaner'],
  },
  'Engine Block': {
    id: 'Engine Block',
    name: 'Internal Combustion Engine Assembly',
    category: 'Spark Plugs',
    system: 'Powertrain & Combustion',
    icon: '⚙️',
    badge: 'Heart of the Vehicle',
    tagline: 'Houses the pistons, crankshaft, cylinders, and combustion chambers.',
    description:
      'The engine block is the structural foundation of the powertrain, containing precision-machined cylinders, water jackets for coolant circulation, and pressurized oil galleys to lubricate high-RPM reciprocating assemblies.',
    lifespan: '200,000+ miles with scheduled oil services and timing maintenance',
    symptoms: [
      'Engine knocking or metallic tapping noise (rod bearing or lifter clearance)',
      'Check Engine Light (Codes P0300 misfire, P0016 timing correlation)',
      'Excessive blue smoke from exhaust (worn piston rings or valve guides)',
      'Overheating or coolant loss without external leaks (head gasket failure)',
    ],
    oemVsAftermarket:
      'Critical internal engine internals (head gaskets, timing chains, sensors) should always use Genuine Factory OEM or Tier-1 German OEM suppliers (Mahle, Elring, Victor Reinz).',
    priceRange: '$150.00 – $2,500.00 (Service Kits to Rebuilt Assemblies)',
    diyDifficulty: 'Advanced',
    tools: ['Engine crane', 'Torque angle gauge', 'Metric socket sets', 'OBD-II Diagnostic Scanner'],
  },
  'Battery': {
    id: 'Battery',
    name: '12V AGM / Lead-Acid Starter Battery',
    category: 'Battery',
    system: 'Electrical & Starting',
    icon: '🔋',
    badge: 'Energy Storage & Start/Stop',
    tagline: 'Supplies high cranking current to starter motor and stabilizes vehicle voltage.',
    description:
      'Modern vehicles use Absorbent Glass Mat (AGM) 12V batteries to support heavy electronic loads, complex infotainment, and start-stop systems. It stores chemical electrical energy and is recharged by the alternator during driving.',
    lifespan: '3 – 5 years (Varies heavily by extreme summer heat & cold winters)',
    symptoms: [
      'Slow, sluggish engine crank ("rur-rur-rur") on cold mornings',
      'Random electronic warning lights or radio resetting',
      'Corrosion buildup (white/blue crust) around positive terminal post',
      'Battery voltage rests below 12.2V with engine off (healthy is 12.6V+)',
    ],
    oemVsAftermarket:
      'Top aftermarket AGM batteries (Duralast Platinum, Interstate, Optima) match OEM specs at 30-40% lower cost. Note: BMW & Mercedes require electronic "battery registration" via OBD-II.',
    priceRange: '$160.00 – $260.00',
    diyDifficulty: 'Easy',
    tools: ['10mm Wrench/Socket', 'Terminal wire brush', 'Dielectric grease', 'OBD-II Scan tool (for battery registration)'],
  },
  'Alternator': {
    id: 'Alternator',
    name: 'Electrical Alternator & Internal Regulator',
    category: 'Alternator',
    system: 'Electrical & Starting',
    icon: '⚡',
    badge: 'Onboard Generator',
    tagline: 'Converts engine mechanical energy into AC/DC electricity while driving.',
    description:
      'Driven by the serpentine belt, the alternator generates electrical power for the vehicle’s ignition, computers, lights, and climate systems while continuously replenishing energy drained from the 12V battery during cranking.',
    lifespan: '80,000 – 130,000 miles',
    symptoms: [
      'Red battery warning icon illuminated on dashboard while engine is running',
      'Dimming headlights that brighten slightly when revving the engine',
      'High-pitched whining or growling bearing sound from the front engine bay',
      'Dead battery after driving (vehicle stalls while in motion)',
    ],
    oemVsAftermarket:
      'Bosch, Valeo, and Denso are the Tier-1 OEM manufacturers for most brands. Buying remanufactured Bosch/Denso units delivers factory reliability with substantial savings.',
    priceRange: '$180.00 – $420.00',
    diyDifficulty: 'Moderate',
    tools: ['Serpentine belt tensioner tool', '10mm/13mm/15mm Sockets', 'Multimeter', 'Torque wrench'],
  },
  'Oil Filter': {
    id: 'Oil Filter',
    name: 'Engine Oil Filter Cartridge & Housing',
    category: 'Oil Filter',
    system: 'Filtration & Lubrication',
    icon: '🛢️',
    badge: 'Routine Service Wear',
    tagline: 'Filters microscopic carbon and metal shavings out of motor oil.',
    description:
      'Traps particulate impurities down to 20 microns to keep the engine oil clean. Clean oil ensures hydrodynamic lubrication of high-stress journal bearings, camshafts, and turbocharger turbines.',
    lifespan: '5,000 – 10,000 miles (Must be changed with EVERY oil change)',
    symptoms: [
      'Dark, gritty motor oil on dipstick',
      'Low oil pressure warning lamp flashing at idle',
      'Engine ticking from hydraulic lifters on cold start',
      'Oil leaks around oil filter canister cap o-ring',
    ],
    oemVsAftermarket:
      'Mann-Filter, Mahle, and Wix are industry gold standards that often supply the exact OEM filters in dealership boxes.',
    priceRange: '$8.00 – $22.00',
    diyDifficulty: 'Easy',
    tools: ['Filter cap socket (e.g. 27mm or 32mm)', 'Oil drain pan', 'Fresh crush washer & O-rings', 'Torque wrench'],
  },
  'Air Filter': {
    id: 'Air Filter',
    name: 'Engine Intake Air Filter',
    category: 'Air Filter',
    system: 'Filtration & Airflow',
    icon: '💨',
    badge: 'Engine Breathing Guard',
    tagline: 'Prevents road dust, sand, and debris from being sucked into the intake.',
    description:
      'Constructed from pleated synthetic or cellulose fibers, the air filter ensures pure, unpolluted airflow into the throttle body and mass airflow (MAF) sensor without restricting volumetric efficiency.',
    lifespan: '15,000 – 30,000 miles',
    symptoms: [
      'Sluggish acceleration and reduced throttle response',
      'Noticeable drop in fuel economy (MPG)',
      'Black soot or fuel smell around exhaust tips',
      'Visible dirt, leaves, or black buildup inside filter pleats',
    ],
    oemVsAftermarket:
      'Aftermarket pleated dry paper filters (Wix, Bosch, Mann) are economical and protect better than oiled mesh filters which can contaminate delicate MAF sensors.',
    priceRange: '$18.00 – $38.00',
    diyDifficulty: 'Easy',
    tools: ['Flathead screwdriver or T25 Torx', 'Shop vacuum (to clean airbox bottom)'],
  },
  'Cabin Air Filter': {
    id: 'Cabin Air Filter',
    name: 'HEPA / Activated Carbon Cabin Filter',
    category: 'Cabin Air Filter',
    system: 'Interior HVAC & Comfort',
    icon: '🍃',
    badge: 'Passenger Cabin Air Quality',
    tagline: 'Cleans air entering through A/C and heating vents before you breathe it.',
    description:
      'Filters pollen, road dust, tire particulates, and exhaust soot before air enters the passenger compartment. Activated charcoal versions neutralize unpleasant outdoor odors and noxious fumes.',
    lifespan: '12,000 – 15,000 miles or 1 year',
    symptoms: [
      'Musty, mildew, or vinegar smell when turning on A/C or heater',
      'Weak airflow blowing from dashboard vents even on maximum fan speed',
      'Windshield fogs up quickly and takes longer to defrost',
      'Whistling or straining noise from the blower motor',
    ],
    oemVsAftermarket:
      'Activated carbon aftermarket filters (Fram Fresh Breeze, Bosch HEPA, Mann FreciousPlus) usually filter finer particles than basic factory paper filters.',
    priceRange: '$14.00 – $32.00',
    diyDifficulty: 'Easy',
    tools: ['Hand access (usually behind glovebox or under cowl)'],
  },
  'Spark Plugs': {
    id: 'Spark Plugs',
    name: 'Iridium / Platinum Spark Plugs',
    category: 'Spark Plugs',
    system: 'Powertrain & Combustion',
    icon: '⚡',
    badge: 'Ignition Flame Front',
    tagline: 'Delivers high-voltage electric arc to ignite compressed fuel-air mixture.',
    description:
      'Spark plugs screw directly into the top of each cylinder head. High-voltage ignition coils fire an intense 25,000V electric spark across the microscopic iridium electrode gap thousands of times per minute.',
    lifespan: '60,000 – 100,000 miles (Laser Iridium)',
    symptoms: [
      'Engine misfire codes (P0300, P0301, P0302, etc.) under acceleration',
      'Rough or vibrating idle at stoplights',
      'Hard cold starting or extended cranking required',
      'Noticeable decrease in acceleration and fuel efficiency',
    ],
    oemVsAftermarket:
      'Stick with the exact OEM brand: NGK Laser Iridium, Denso, or Bosch. Always verify factory electrode gap before installing.',
    priceRange: '$45.00 – $110.00 for set of 4 to 6 plugs',
    diyDifficulty: 'Moderate',
    tools: ['5/8" or 14mm Magnetic Spark Plug Socket', 'Extension bar', 'Torque wrench (crucial to prevent stripping head threads)'],
  },
  'Shock Absorbers': {
    id: 'Shock Absorbers',
    name: 'Front Struts & Rear Shock Absorbers',
    category: 'Shock Absorbers',
    system: 'Suspension & Handling',
    icon: '🏎️',
    badge: 'Chassis Stability & Comfort',
    tagline: 'Dampens suspension oscillation to keep tire contact firmly on the pavement.',
    description:
      'Hydraulic gas-pressurized shock absorbers control the rebound and compression of suspension coil springs. They prevent the car from bouncing uncontrollably over road bumps, providing tire grip and passenger comfort.',
    lifespan: '60,000 – 90,000 miles',
    symptoms: [
      'Vehicle bounces repeatedly after going over speed bumps or dips',
      'Front nose-dives heavily forward under firm braking',
      'Hydraulic oil weeping or coating the exterior damper shaft',
      'Uneven "cupping" or scalloped wear patterns on tire tread',
    ],
    oemVsAftermarket:
      'Bilstein B4/B6 and Sachs provide legendary ride quality and durability. Complete strut assemblies ("quick-struts") include pre-compressed springs for safer DIY installation.',
    priceRange: '$120.00 – $320.00 per strut/shock',
    diyDifficulty: 'Advanced',
    tools: ['Spring compressor (if rebuilding strut)', '18mm/21mm Strut nut sockets', 'Impact wrench', 'Alignment after install'],
  },
  'Serpentine Belt': {
    id: 'Serpentine Belt',
    name: 'Multi-Ribbed EPDM Serpentine Accessory Belt',
    category: 'Serpentine Belt',
    system: 'Powertrain & Accessories',
    icon: '🌀',
    badge: 'Mechanical Drive Loop',
    tagline: 'Spins the alternator, water pump, power steering, and A/C compressor.',
    description:
      'A continuous reinforced synthetic rubber (EPDM) belt driven by the engine crankshaft. It routes around pulleys to drive critical accessories including the electrical alternator, cooling water pump, and air conditioning.',
    lifespan: '60,000 – 100,000 miles',
    symptoms: [
      'High-pitched screeching or chirping sound from engine bay on start or acceleration',
      'Sudden loss of power steering assistance or battery charging indicator illuminated',
      'Visible micro-cracking, frayed cords, or missing ribs on belt underside',
      'Belt tensioner indicator mark out of spec',
    ],
    oemVsAftermarket:
      'Continental (ContiTech) and Gates are premier OEM belt suppliers and provide quiet, long-lasting grip.',
    priceRange: '$22.00 – $48.00',
    diyDifficulty: 'Moderate',
    tools: ['Serpentine belt tensioner wrench', 'Belt routing diagram', 'Pinch bar'],
  },
};

export class Car3DScene {
  private container!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  // Scene Groups
  private carRoot!: THREE.Group;
  private chassisGroup!: THREE.Group;
  private wheelsGroup!: THREE.Group;
  private mechanicalGroup!: THREE.Group;
  private glassGroup!: THREE.Group;

  // Part meshes registry
  private partMeshes: Map<string, THREE.Mesh[]> = new Map();
  private originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map();

  // Raycasting & Interaction
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private hoveredPartKey: string | null = null;
  private selectedPartKey: string | null = null;
  private onSelectCallback?: (partKey: string) => void;
  private onHoverCallback?: (partKey: string | null) => void;

  // Animation Loop State
  private animationFrameId: number | null = null;
  private isAutoRotating = true;
  private xRayOpacity = 0.55; // 0 = solid, 1 = transparent
  private explodeFactor = 0.0; // 0 = normal, 1 = fully exploded

  // Camera Tweening
  private targetCameraPos: THREE.Vector3 | null = null;
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 0.4, 0);
  private defaultCameraPos = new THREE.Vector3(3.6, 1.8, 3.8);

  // Studio Theme Elements
  private isLightMode = false;
  private gridHelper!: THREE.GridHelper;
  private pedestalMat!: THREE.MeshStandardMaterial;
  private ringMat!: THREE.MeshBasicMaterial;
  private ambientLight!: THREE.AmbientLight;
  private keyLight!: THREE.DirectionalLight;

  // Highlighting Materials
  private hoverMaterial = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x0099cc,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8,
  });

  private selectedMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff88,
    emissive: 0x00aa55,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.9,
  });

  init(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    onSelect: (partKey: string) => void,
    onHover: (partKey: string | null) => void
  ): void {
    this.container = container;
    this.canvas = canvas;
    this.onSelectCallback = onSelect;
    this.onHoverCallback = onHover;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0f17);
    this.scene.fog = new THREE.FogExp2(0x0c0f17, 0.04);

    // 2. CAMERA
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.copy(this.defaultCameraPos);

    // 3. RENDERER
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. ORBIT CONTROLS
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 12.0;
    this.controls.target.copy(this.targetLookAt);

    // 5. LIGHTING (Cinematic Studio Rig)
    this.setupLighting();

    // 6. ENVIRONMENT (Floor Grid & Pedestal)
    this.setupEnvironment();

    // 7. BUILD 3D CAR HIERARCHY
    this.buildCarModel();

    // 8. EVENT LISTENERS
    this.setupEvents();

    // 9. START RENDER LOOP
    this.startLoop();
  }

  private setupLighting(): void {
    // Ambient soft fill
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(this.ambientLight);

    // Main Key Light
    this.keyLight = new THREE.DirectionalLight(0xe8f0fe, 1.8);
    this.keyLight.position.set(5, 7, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    // Cool Rim / Edge Backlight
    const rimLight = new THREE.DirectionalLight(0x00c8ff, 1.2);
    rimLight.position.set(-6, 3, -6);
    this.scene.add(rimLight);

    // Warm Front Accent
    const accentLight = new THREE.DirectionalLight(0xff7733, 0.6);
    accentLight.position.set(4, 2, -4);
    this.scene.add(accentLight);

    // Engine Bay Internal Glow
    const enginePoint = new THREE.PointLight(0x00f0ff, 1.0, 3.5);
    enginePoint.position.set(0, 0.6, 1.2);
    this.scene.add(enginePoint);
  }

  private setupEnvironment(): void {
    // Cyber Grid Floor
    this.gridHelper = new THREE.GridHelper(20, 40, 0x00f0ff, 0x1f293d);
    this.gridHelper.position.y = -0.01;
    this.scene.add(this.gridHelper);

    // Reflective Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(3.5, 3.7, 0.1, 48);
    this.pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.4,
      metalness: 0.8,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, this.pedestalMat);
    pedestal.position.y = -0.05;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);

    // Glowing Neon Ring around turntable
    const ringGeo = new THREE.TorusGeometry(3.6, 0.02, 16, 64);
    this.ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const ring = new THREE.Mesh(ringGeo, this.ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.04;
    this.scene.add(ring);
  }

  private buildCarModel(): void {
    this.carRoot = new THREE.Group();
    this.chassisGroup = new THREE.Group();
    this.wheelsGroup = new THREE.Group();
    this.mechanicalGroup = new THREE.Group();
    this.glassGroup = new THREE.Group();

    this.carRoot.add(this.chassisGroup);
    this.carRoot.add(this.wheelsGroup);
    this.carRoot.add(this.mechanicalGroup);
    this.carRoot.add(this.glassGroup);

    // Build sub-assemblies
    this.createChassisBody();
    this.createWheelsAndBrakes();
    this.createEnginePowertrain();
    this.createBatteryAndElectrical();
    this.createFiltrationAndIntake();
    this.createSuspension();

    this.scene.add(this.carRoot);
  }

  // ==========================================
  // CHASSIS & EXTERIOR SHELL
  // ==========================================
  private createChassisBody(): void {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e2738,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 1.0 - this.xRayOpacity * 0.8,
      side: THREE.DoubleSide,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.35,
    });

    // Main lower fuselage
    const lowerGeo = new THREE.BoxGeometry(1.6, 0.42, 3.8);
    const lowerBody = new THREE.Mesh(lowerGeo, bodyMat);
    lowerBody.position.set(0, 0.38, 0);
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    this.chassisGroup.add(lowerBody);

    // Cabin greenhouse / roof
    const cabinGeo = new THREE.BoxGeometry(1.36, 0.45, 1.9);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 0.76, -0.2);
    cabin.castShadow = true;
    this.chassisGroup.add(cabin);

    // Sloped Windshield
    const windGeo = new THREE.BoxGeometry(1.34, 0.46, 0.08);
    const windshield = new THREE.Mesh(windGeo, glassMat);
    windshield.position.set(0, 0.74, 0.75);
    windshield.rotation.x = -Math.PI / 4;
    this.glassGroup.add(windshield);

    // Rear Window
    const rearWindGeo = new THREE.BoxGeometry(1.34, 0.46, 0.08);
    const rearWind = new THREE.Mesh(rearWindGeo, glassMat);
    rearWind.position.set(0, 0.74, -1.15);
    rearWind.rotation.x = Math.PI / 4;
    this.glassGroup.add(rearWind);

    // Hood / Bonnet (Moves up in Exploded View)
    const hoodGeo = new THREE.BoxGeometry(1.5, 0.08, 1.1);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(0, 0.62, 1.25);
    hood.name = 'hood_cover';
    this.chassisGroup.add(hood);

    // Front Grille & Headlights
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.8 });
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.1), grilleMat);
    grille.position.set(0, 0.32, 1.91);
    this.chassisGroup.add(grille);

    const lightMat = new THREE.MeshBasicMaterial({ color: 0x99e5ff });
    const lHead = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), lightMat);
    lHead.position.set(0.55, 0.42, 1.9);
    this.chassisGroup.add(lHead);

    const rHead = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), lightMat);
    rHead.position.set(-0.55, 0.42, 1.9);
    this.chassisGroup.add(rHead);
  }

  // ==========================================
  // WHEELS & BRAKE ASSEMBLIES
  // ==========================================
  private createWheelsAndBrakes(): void {
    const wheelPositions = [
      { name: 'FL', x: 0.88, z: 1.15, category: 'Brake Rotors' },
      { name: 'FR', x: -0.88, z: 1.15, category: 'Brake Rotors' },
      { name: 'RL', x: 0.88, z: -1.15, category: 'Brake Pads' },
      { name: 'RR', x: -0.88, z: -1.15, category: 'Brake Pads' },
    ];

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x151618, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd0d5dd, metalness: 0.9, roughness: 0.15 });
    const rotorMat = new THREE.MeshStandardMaterial({ color: 0xc8cdd6, metalness: 0.95, roughness: 0.1 });
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, metalness: 0.5, roughness: 0.3 }); // Red Brembo style

    wheelPositions.forEach((pos) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(pos.x, 0.32, pos.z);
      wheelAssembly.name = `wheel_${pos.name}`;

      // 1. Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 28);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      wheelAssembly.add(tire);

      // 2. Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.23, 24);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelAssembly.add(rim);

      // 3. BRAKE ROTOR (Clickable Interactive Component)
      const rotorGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.04, 28);
      rotorGeo.rotateZ(Math.PI / 2);
      const rotor = new THREE.Mesh(rotorGeo, rotorMat.clone());
      rotor.position.x = pos.x > 0 ? -0.1 : 0.1;
      rotor.castShadow = true;
      this.tagInteractivePart(rotor, pos.category);
      wheelAssembly.add(rotor);

      // 4. BRAKE CALIPER (Clickable Interactive Component)
      const caliperGeo = new THREE.BoxGeometry(0.08, 0.12, 0.15);
      const caliper = new THREE.Mesh(caliperGeo, caliperMat.clone());
      caliper.position.set(pos.x > 0 ? -0.1 : 0.1, 0.1, 0.04);
      this.tagInteractivePart(caliper, 'Brake Pads');
      wheelAssembly.add(caliper);

      this.wheelsGroup.add(wheelAssembly);
    });
  }

  // ==========================================
  // POWERTRAIN: ENGINE & ALTERNATOR
  // ==========================================
  private createEnginePowertrain(): void {
    const engineGroup = new THREE.Group();
    engineGroup.position.set(0, 0.46, 1.15);

    // Engine Block
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x333b4d, metalness: 0.8, roughness: 0.4 });
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.42, 0.72), blockMat);
    block.castShadow = true;
    this.tagInteractivePart(block, 'Engine Block');
    engineGroup.add(block);

    // Chrome Valve Cover
    const valveMat = new THREE.MeshStandardMaterial({ color: 0xa8b3cf, metalness: 0.9, roughness: 0.2 });
    const valveCover = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.1, 0.68), valveMat);
    valveCover.position.y = 0.25;
    this.tagInteractivePart(valveCover, 'Spark Plugs');
    engineGroup.add(valveCover);

    // ALTERNATOR (Cylindrical generator with copper coil hint)
    const altMat = new THREE.MeshStandardMaterial({ color: 0x8c95a6, metalness: 0.85, roughness: 0.3 });
    const altGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.22, 20);
    altGeo.rotateZ(Math.PI / 2);
    const alternator = new THREE.Mesh(altGeo, altMat);
    alternator.position.set(0.42, 0.08, 0.2);

    // Alternator Pulley
    const pulleyGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16);
    pulleyGeo.rotateZ(Math.PI / 2);
    const pulley = new THREE.Mesh(pulleyGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
    pulley.position.set(0.54, 0.08, 0.2);
    alternator.add(pulley);

    this.tagInteractivePart(alternator, 'Alternator');
    engineGroup.add(alternator);

    // SERPENTINE BELT (Ribbed black loop around pulleys)
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const beltGeo = new THREE.TorusGeometry(0.24, 0.02, 12, 32);
    beltGeo.rotateY(Math.PI / 2);
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(0.53, 0.04, 0.08);
    this.tagInteractivePart(belt, 'Serpentine Belt');
    engineGroup.add(belt);

    this.mechanicalGroup.add(engineGroup);
  }

  // ==========================================
  // ELECTRICAL: 12V AGM BATTERY
  // ==========================================
  private createBatteryAndElectrical(): void {
    const batteryGroup = new THREE.Group();
    batteryGroup.position.set(-0.52, 0.52, 0.72);

    // Black battery case
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x1c1e24, roughness: 0.7 });
    const batteryBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.26, 0.24), caseMat);
    batteryBox.castShadow = true;
    this.tagInteractivePart(batteryBox, 'Battery');
    batteryGroup.add(batteryBox);

    // Positive Terminal (Red)
    const posMat = new THREE.MeshStandardMaterial({ color: 0xe53935 });
    const posTerminal = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05), posMat);
    posTerminal.position.set(0.08, 0.15, -0.06);
    batteryGroup.add(posTerminal);

    // Negative Terminal (Black/Blue)
    const negMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5 });
    const negTerminal = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05), negMat);
    negTerminal.position.set(-0.08, 0.15, -0.06);
    batteryGroup.add(negTerminal);

    this.mechanicalGroup.add(batteryGroup);
  }

  // ==========================================
  // FILTRATION: OIL & AIR FILTERS
  // ==========================================
  private createFiltrationAndIntake(): void {
    // 1. OIL FILTER (Cylindrical canister on engine side)
    const filterMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, metalness: 0.6, roughness: 0.3 }); // Royal Blue
    const filterGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.18, 18);
    const oilFilter = new THREE.Mesh(filterGeo, filterMat);
    oilFilter.position.set(0.38, 0.38, 0.88);
    oilFilter.rotation.z = Math.PI / 6;
    this.tagInteractivePart(oilFilter, 'Oil Filter');
    this.mechanicalGroup.add(oilFilter);

    // 2. AIR FILTER BOX (Intake filter housing)
    const airboxMat = new THREE.MeshStandardMaterial({ color: 0x212529, roughness: 0.8 });
    const airbox = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.34), airboxMat);
    airbox.position.set(-0.52, 0.54, 1.25);
    this.tagInteractivePart(airbox, 'Air Filter');
    this.mechanicalGroup.add(airbox);

    // Intake Tube
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const tubeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    tubeGeo.rotateZ(Math.PI / 2);
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(-0.3, 0.54, 1.25);
    this.mechanicalGroup.add(tube);

    // 3. CABIN AIR FILTER (Firewall HVAC inlet)
    const cabinFilterMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.7 });
    const cabinFilter = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.18), cabinFilterMat);
    cabinFilter.position.set(0.2, 0.62, 0.45);
    this.tagInteractivePart(cabinFilter, 'Cabin Air Filter');
    this.mechanicalGroup.add(cabinFilter);
  }

  // ==========================================
  // SUSPENSION: SHOCK ABSORBER COILS
  // ==========================================
  private createSuspension(): void {
    const shockMat = new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.7, roughness: 0.3 }); // Yellow performance shocks
    const positions = [
      { x: 0.68, z: 1.15 },
      { x: -0.68, z: 1.15 },
      { x: 0.68, z: -1.15 },
      { x: -0.68, z: -1.15 },
    ];

    positions.forEach((pos) => {
      const shockGroup = new THREE.Group();
      shockGroup.position.set(pos.x, 0.44, pos.z);

      // Damper Strut Cylinder
      const strutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.36, 12);
      const strut = new THREE.Mesh(strutGeo, shockMat);
      shockGroup.add(strut);

      // Spring Coils
      const springMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
      for (let i = -0.12; i <= 0.12; i += 0.06) {
        const coil = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 16), springMat);
        coil.rotation.x = Math.PI / 2;
        coil.position.y = i;
        shockGroup.add(coil);
      }

      this.tagInteractivePart(strut, 'Shock Absorbers');
      this.mechanicalGroup.add(shockGroup);
    });
  }

  // ==========================================
  // INTERACTIVITY & RAYCASTING TAGS
  // ==========================================
  private tagInteractivePart(mesh: THREE.Mesh, partKey: string): void {
    mesh.userData = { partKey };
    if (!this.partMeshes.has(partKey)) {
      this.partMeshes.set(partKey, []);
    }
    this.partMeshes.get(partKey)!.push(mesh);
    this.originalMaterials.set(mesh, mesh.material);
  }

  private setupEvents(): void {
    const onPointerMove = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.handleHover();
    };

    const onClick = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.handleClick();
    };

    this.canvas.addEventListener('mousemove', onPointerMove);
    this.canvas.addEventListener('click', onClick);

    // Responsive Canvas Resize
    const onResize = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w && h) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', onResize);
  }

  private handleHover(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let foundKey: string | null = null;
    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData['partKey']) {
        foundKey = hit.object.userData['partKey'];
        break;
      }
    }

    if (foundKey !== this.hoveredPartKey) {
      this.hoveredPartKey = foundKey;
      this.canvas.style.cursor = foundKey ? 'pointer' : 'default';
      this.refreshMaterials();
      if (this.onHoverCallback) {
        this.onHoverCallback(foundKey);
      }
    }
  }

  private handleClick(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      if (hit.object.userData && hit.object.userData['partKey']) {
        const key = hit.object.userData['partKey'];
        this.selectPart(key);
        break;
      }
    }
  }

  selectPart(partKey: string): void {
    this.selectedPartKey = partKey;
    this.refreshMaterials();

    // Smooth camera focus onto selected part
    const meshes = this.partMeshes.get(partKey);
    if (meshes && meshes.length > 0) {
      const targetMesh = meshes[0];
      const worldPos = new THREE.Vector3();
      targetMesh.getWorldPosition(worldPos);

      this.targetLookAt.copy(worldPos);
      this.targetCameraPos = new THREE.Vector3()
        .copy(worldPos)
        .add(new THREE.Vector3(1.2, 0.8, 1.4));
    }

    if (this.onSelectCallback) {
      this.onSelectCallback(partKey);
    }
  }

  private refreshMaterials(): void {
    this.partMeshes.forEach((meshes, key) => {
      const isSelected = key === this.selectedPartKey;
      const isHovered = key === this.hoveredPartKey;

      meshes.forEach((mesh) => {
        if (isSelected) {
          mesh.material = this.selectedMaterial;
        } else if (isHovered) {
          mesh.material = this.hoverMaterial;
        } else {
          mesh.material = this.originalMaterials.get(mesh) || mesh.material;
        }
      });
    });
  }

  // ==========================================
  // VIEWPORT CONTROLS API
  // ==========================================
  setAutoRotate(enabled: boolean): void {
    this.isAutoRotating = enabled;
  }

  setXRay(opacity: number): void {
    this.xRayOpacity = THREE.MathUtils.clamp(opacity, 0, 1);
    const solidOpacity = THREE.MathUtils.lerp(1.0, 0.12, this.xRayOpacity);

    this.chassisGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name !== 'hood_cover') {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.transparent = true;
          mat.opacity = solidOpacity;
          mat.wireframe = this.xRayOpacity > 0.85;
        }
      }
    });
  }

  setExploded(factor: number): void {
    this.explodeFactor = THREE.MathUtils.clamp(factor, 0, 1);

    // 1. Move Wheels Outward (X-axis)
    const fl = this.wheelsGroup.getObjectByName('wheel_FL');
    const fr = this.wheelsGroup.getObjectByName('wheel_FR');
    const rl = this.wheelsGroup.getObjectByName('wheel_RL');
    const rr = this.wheelsGroup.getObjectByName('wheel_RR');

    const expandX = this.explodeFactor * 0.8;
    if (fl) fl.position.x = 0.88 + expandX;
    if (fr) fr.position.x = -0.88 - expandX;
    if (rl) rl.position.x = 0.88 + expandX;
    if (rr) rr.position.x = -0.88 - expandX;

    // 2. Lift Hood & Upper Cabin (Y-axis)
    const hood = this.chassisGroup.getObjectByName('hood_cover');
    if (hood) {
      hood.position.y = 0.62 + this.explodeFactor * 0.9;
      hood.position.z = 1.25 + this.explodeFactor * 0.3;
    }

    // 3. Lift Roof Cabin Upward
    this.glassGroup.position.y = this.explodeFactor * 0.7;
  }

  resetCamera(): void {
    this.selectedPartKey = null;
    this.hoveredPartKey = null;
    this.refreshMaterials();
    this.targetLookAt.set(0, 0.4, 0);
    this.targetCameraPos = this.defaultCameraPos.clone();
  }

  setStudioTheme(theme: 'dark' | 'light'): void {
    this.isLightMode = theme === 'light';

    if (this.isLightMode) {
      // Clean, bright, photorealistic white/light studio background
      this.scene.background = new THREE.Color(0xf6f8fc);
      this.scene.fog = new THREE.FogExp2(0xf6f8fc, 0.02);

      if (this.pedestalMat) {
        this.pedestalMat.color.setHex(0xe2e8f0);
        this.pedestalMat.roughness = 0.55;
        this.pedestalMat.metalness = 0.25;
      }
      if (this.ringMat) {
        this.ringMat.color.setHex(0x0284c7);
      }
      if (this.gridHelper) {
        this.scene.remove(this.gridHelper);
        this.gridHelper = new THREE.GridHelper(20, 40, 0x0284c7, 0xcfd8e3);
        this.gridHelper.position.y = -0.01;
        this.scene.add(this.gridHelper);
      }
      if (this.ambientLight) {
        this.ambientLight.intensity = 1.05;
      }
      if (this.keyLight) {
        this.keyLight.intensity = 2.0;
        this.keyLight.color.setHex(0xffffff);
      }
    } else {
      // Cyber Dark Studio
      this.scene.background = new THREE.Color(0x0c0f17);
      this.scene.fog = new THREE.FogExp2(0x0c0f17, 0.04);

      if (this.pedestalMat) {
        this.pedestalMat.color.setHex(0x111622);
        this.pedestalMat.roughness = 0.4;
        this.pedestalMat.metalness = 0.8;
      }
      if (this.ringMat) {
        this.ringMat.color.setHex(0x00e5ff);
      }
      if (this.gridHelper) {
        this.scene.remove(this.gridHelper);
        this.gridHelper = new THREE.GridHelper(20, 40, 0x00f0ff, 0x1f293d);
        this.gridHelper.position.y = -0.01;
        this.scene.add(this.gridHelper);
      }
      if (this.ambientLight) {
        this.ambientLight.intensity = 0.7;
      }
      if (this.keyLight) {
        this.keyLight.intensity = 1.8;
        this.keyLight.color.setHex(0xe8f0fe);
      }
    }
  }

  // ==========================================
  // RENDER LOOP
  // ==========================================
  private startLoop(): void {
    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);

      // Auto-turntable spinning
      if (this.isAutoRotating && !this.selectedPartKey) {
        this.carRoot.rotation.y += 0.005;
      }

      // Smooth camera tweening when a part is focused
      if (this.targetCameraPos) {
        this.camera.position.lerp(this.targetCameraPos, 0.06);
        this.controls.target.lerp(this.targetLookAt, 0.06);
        if (this.camera.position.distanceTo(this.targetCameraPos) < 0.02) {
          this.targetCameraPos = null;
        }
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };

    render();
  }

  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
