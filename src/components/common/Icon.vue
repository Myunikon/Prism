<script setup>
import { computed } from 'vue';
import {
  Activity, AlertCircle, AlertOctagon, AlertTriangle, Antenna, ArrowLeft, ArrowRight, ArrowUp, AtSign,
  Barcode, Binary, Bluetooth, BluetoothSearching, BookOpen, Bot, Briefcase,
  Calculator, CalendarDays, Camera, CameraOff, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CircleAlert, CircleCheck, CircleDot, CircleHelp, CircleX, Clipboard, Clock, Cloud, CloudDownload, CloudUpload,
  Code, Copy, Cpu, Crosshair,
  Database, Download,
  Ellipsis, Eraser, ExternalLink, Eye, EyeOff,
  File, FileCode, FileImage, FileOutput, FileSearch, FileText, Filter, Fingerprint, FolderOpen, FolderPlus,
  Gauge, Github, Globe,
  HardDrive, Hash, Home,
  Image, ImagePlus, Inbox, Info,
  Key, Keyboard,
  Languages, Layers, LayoutDashboard, Lightbulb, Link, Link2Off, ListChecks, ListOrdered, Loader2, Lock,
  Mail, Map, MapPin, Menu, Microscope, Minus, Monitor, Moon, MoreHorizontal,
  Network,
  Paintbrush, Palette, Pause, Phone, Play, Plug, Plus,
  QrCode,
  Radar, Radio, RefreshCw, Rocket, RotateCw, Router,
  Scale, Scan, Search, SearchCode, Server, Settings, Share2, Shield, ShieldAlert, ShieldCheck, ShieldX, Signal, Smartphone, Sparkles, Square, Sun, SwitchCamera,
  Tag, Terminal, Timer, TowerControl, Trash2, TrendingUp, TriangleAlert, Type,
  Unlock, Upload, User, UserRound, UserSearch, Users,
  VenetianMask,
  Wand2, Webhook, Wifi, WifiOff, Wrench,
  X,
  Zap
} from 'lucide-vue-next';

// Map FontAwesome icon names to Lucide components
const iconMap = {
  // Shield/Security
  'fa-shield-halved': ShieldCheck,
  'fa-shield-virus': ShieldAlert,
  'fa-shield': Shield,

  // Camera/Scanner
  'fa-camera': Camera,
  'fa-camera-slash': CameraOff,
  'fa-camera-rotate': SwitchCamera,
  'fa-qrcode': QrCode,
  'fa-barcode': Barcode,
  'fa-crosshairs': Crosshair,
  'fa-mobile-screen': Smartphone,

  // Files
  'fa-file': File,
  'fa-file-lines': FileText,
  'fa-file-circle-check': FileSearch,

  // Settings/Config
  'fa-gear': Settings,
  'fa-sliders': Settings,

  // Navigation
  'fa-chevron-down': ChevronDown,
  'fa-chevron-right': ChevronRight,
  'fa-chevron-left': ChevronLeft,
  'fa-arrow-left': ArrowLeft,
  'fa-arrow-right': ArrowRight,
  'fa-arrow-up': ArrowUp,
  'fa-arrow-right-from-bracket': ExternalLink,

  // Actions
  'fa-xmark': X,
  'fa-check': Check,
  'fa-plus': Plus,
  'fa-minus': Minus,
  'fa-trash-can': Trash2,
  'fa-copy': Copy,
  'fa-download': Download,

  // Search
  'fa-magnifying-glass': Search,
  'fa-magnifying-glass-arrow-right': SearchCode,

  // Security/Crypto
  'fa-lock': Lock,
  'fa-unlock': Unlock,
  'fa-key': Key,
  'fa-fingerprint': Fingerprint,

  // Links
  'fa-link': Link,
  'fa-link-slash': Link2Off,

  // Network
  'fa-globe': Globe,
  'fa-wifi': Wifi,
  'fa-signal': Signal,
  'fa-server': Server,
  'fa-network-wired': Network,
  'fa-tower-broadcast': Antenna,
  'fa-tower-cell': TowerControl,

  // Time
  'fa-clock': Clock,
  'fa-clock-rotate-left': Timer,
  'fa-calendar-days': CalendarDays,

  // View
  'fa-eye': Eye,
  'fa-eye-slash': EyeOff,

  // Code/Dev
  'fa-code': Code,
  'fa-terminal': Terminal,
  'fa-keyboard': Keyboard,

  // Analysis
  'fa-microscope': Microscope,
  'fa-layer-group': Layers,

  // Location
  'fa-map-location-dot': MapPin,
  'fa-map': Map,

  // Image
  'fa-image': Image,
  'fa-image-portrait': ImagePlus,

  // Containers
  'fa-inbox': Inbox,
  'fa-briefcase': Briefcase,

  // Theme
  'fa-moon': Moon,
  'fa-sun': Sun,
  'fa-palette': Palette,

  // Text
  'fa-language': Languages,
  'fa-font': Type,
  'fa-text-height': Type,
  'fa-check-circle': CheckCircle,

  // Info
  'fa-circle-info': Info,
  'fa-circle-question': CircleHelp,
  'fa-triangle-exclamation': TriangleAlert,

  // Rotate/Refresh
  'fa-rotate': RefreshCw,
  'fa-rotate-right': RotateCw,
  'fa-arrows-rotate': RefreshCw,

  // Media controls
  'fa-play': Play,
  'fa-pause': Pause,
  'fa-stop': Square,

  // Radio/Bluetooth
  'fa-bluetooth': Bluetooth,
  'fa-bluetooth-b': BluetoothSearching,
  'fa-satellite-dish': Antenna,
  'fa-radio': Radio,

  // Misc
  'fa-hashtag': Hash,
  'fa-binary': Binary,
  'fa-user-secret': UserSearch,
  'fa-user': UserRound,
  'fa-robot': Bot,
  'fa-microchip': Cpu,
  'fa-envelope': Mail,
  'fa-at': AtSign,
  'fa-wand-magic-sparkles': Wand2,
  'fa-calculator': Calculator,
  'fa-list-ol': ListOrdered,
  'fa-database': Database,
  'fa-spinner': Loader2,
  'fa-ellipsis': MoreHorizontal,
  'fa-tag': Tag,
  'fa-id-card': FileCode,
  'fa-webhook': Webhook,
  'fa-bolt': Zap,
  'fa-circle-dot': CircleDot,
  'fa-eraser': Eraser,
  'fa-paintbrush': Paintbrush,
  'fa-wrench': Settings,
  'fa-screwdriver-wrench': Wrench,
  'fa-filter': Filter,
  'fa-mask': VenetianMask,
  'fa-file-image': FileImage,
  'fa-file-export': FileOutput,
  'fa-radar': Radar,
  // Group 1
  'fa-cloud-arrow-up': CloudUpload,
  'fa-folder-open': FolderOpen,
  'fa-book-open': BookOpen,
  'fa-gauge': Gauge,
  'fa-folder-plus': FolderPlus,
  'fa-lightbulb': Lightbulb,
  'fa-list-check': ListChecks,
  'fa-magnifying-glass': Search,
  'fa-virus-slash': ShieldAlert,
  'fa-exclamation-triangle': TriangleAlert,
  'fa-trash': Trash2,
  'fa-info-circle': Info,
  'fa-location-dot': MapPin,
  
  // Group 2
  'fa-exclamation-circle': CircleAlert,
  'fa-redo': RotateCw,
  'fa-phone': Phone,
  'fa-palette': Palette,
  'fa-database': Database,
  'fa-terminal': Terminal,
  'fa-shuttle-space': Rocket,
  
  // Group 3
  'fa-circle-xmark': CircleX,
  'fa-circle-exclamation': CircleAlert,
  'fa-chart-line': TrendingUp,
  'fa-weight-scale': Scale,
  
  // Group 4
  'fa-github': Github,
  'fa-plug': Plug,
  'fa-bolt': Zap,
  'fa-text-height': Type,
  'fa-wand-magic-sparkles': Wand2,
  'fa-trash-can': Trash2,
  'fa-mobile-screen-button': Smartphone,
};

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: undefined },
  class: { type: String, default: '' },
});

const resolvedIcon = computed(() => {
  if (iconMap[props.name]) return iconMap[props.name];

  // Handle classes like "fa-solid fa-house" -> find "fa-house"
  if (props.name.includes(' ')) {
    const parts = props.name.split(' ');
    for (const part of parts) {
      if (iconMap[part]) return iconMap[part];
    }
  }

  return CircleDot; // fallback icon
});

const iconSize = computed(() => {
  if (props.size) return Number(props.size);
  // Infer size from class names
  const cls = props.class || '';
  if (cls.includes('text-6xl')) return 48;
  if (cls.includes('text-5xl')) return 40;
  if (cls.includes('text-4xl')) return 36;
  if (cls.includes('text-3xl')) return 30;
  if (cls.includes('text-2xl')) return 24;
  if (cls.includes('text-xl')) return 20;
  if (cls.includes('text-lg')) return 18;
  if (cls.includes('text-base')) return 16;
  if (cls.includes('text-sm')) return 14;
  if (cls.includes('text-xs')) return 12;
  return 16;
});

// Filter out fa-specific and text-size classes, keeping only color/spacing/etc
const filteredClass = computed(() => {
  const cls = props.class || '';
  return cls.split(' ').filter(c =>
    !c.startsWith('fa-') &&
    !['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'].includes(c)
  ).join(' ');
});
</script>

<template>
  <component
    :is="resolvedIcon"
    :size="iconSize"
    :stroke-width="2"
    :class="filteredClass"
  />
</template>
