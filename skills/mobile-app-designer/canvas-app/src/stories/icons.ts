import { createElement } from 'lucide';
import type { IconNode } from 'lucide';
import {
  Home, Search, User, Settings, MessageCircle, Bell, Wifi, Battery,
  Plane, ChevronRight, Plus, ArrowLeft, Calendar, ListTodo,
  Heart, Star, Share2, Mail, Copy, Link, Music, Trash2, Edit,
  Check, Square, SquareCheck, Clock, Tag, Volume2, Moon, Palette,
  Smartphone, RefreshCw, Package, Lightbulb, LayoutGrid,
  Bookmark, X, Send, Image, Download, Upload, Camera, Mic,
  MapPin, Phone, Globe, Lock, Eye, EyeOff, Filter, SortAsc,
  MoreHorizontal, ChevronDown, ChevronUp, Info, AlertCircle,
  CheckCircle, XCircle, Zap, Shield, CreditCard, ShoppingCart,
  Play, Pause, SkipForward, SkipBack, Repeat, Shuffle,
  Clipboard,
} from 'lucide';

function renderIcon(iconNode: IconNode, size = 20, color = 'currentColor', strokeWidth = 1.75): string {
  const el = createElement(iconNode as IconNode);
  el.setAttribute('width', String(size));
  el.setAttribute('height', String(size));
  el.setAttribute('stroke', color);
  el.setAttribute('stroke-width', String(strokeWidth));
  const wrapper = document.createElement('div');
  wrapper.appendChild(el);
  return wrapper.innerHTML;
}

// Pre-render commonly used icons as HTML strings
export function icon(iconNode: IconNode, size = 20, color = 'currentColor'): string {
  return renderIcon(iconNode, size, color);
}

// Export all icons for convenience
export {
  Home, Search, User, Settings, MessageCircle, Bell, Wifi, Battery,
  Plane, ChevronRight, Plus, ArrowLeft, Calendar, ListTodo,
  Heart, Star, Share2, Mail, Copy, Link, Music, Trash2, Edit,
  Check, Square, SquareCheck, Clock, Tag, Volume2, Moon, Palette,
  Smartphone, RefreshCw, Package, Lightbulb, LayoutGrid,
  Bookmark, X, Send, Image, Download, Upload, Camera, Mic,
  MapPin, Phone, Globe, Lock, Eye, EyeOff, Filter, SortAsc,
  MoreHorizontal, ChevronDown, ChevronUp, Info, AlertCircle,
  CheckCircle, XCircle, Zap, Shield, CreditCard, ShoppingCart,
  Play, Pause, SkipForward, SkipBack, Repeat, Shuffle,
  Clipboard,
};
