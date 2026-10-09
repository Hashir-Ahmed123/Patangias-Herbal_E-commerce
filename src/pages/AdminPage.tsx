import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  RefreshCw,
  LogOut,
  Trash2,
  Download,
  FileDown,
  Save,
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  Settings,
  Store,
  Star
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { toPng } from 'html-to-image';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { formatOrderDateTime, parseOrderDate } from '../lib/orderDate';
import { getBundlePriceForCount } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, Link } from '../context/NavigationContext';
import { useStoreSettings, type StoreSettings } from '../context/StoreSettingsContext';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  paymentMethod: string;
  paymentProvider?: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  quantity: number;
  orderItems?: { id: string; name: string; quantity: number; price: number; lineTotal?: number; bundleDiscount?: number }[];
  deliveryCharge?: number;
  itemsSubtotal?: number;
  bundleDiscount?: number;
  orderNotes?: string;
  createdAt?: string | Timestamp;
  userId?: string;
  userEmail?: string;
}

interface ProductReview {
  id: string;
  orderNumber: string;
  displayName: string;
  rating: number;
  comment: string;
  createdAt?: string | Timestamp;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#D29A2E' },
  { value: 'confirmed', label: 'Confirmed', color: '#4779A8' },
  { value: 'shipped', label: 'Shipped', color: '#4B9188' },
  { value: 'delivered', label: 'Delivered', color: '#287451' },
  { value: 'cancelled', label: 'Cancelled', color: '#B75650' },
] as const;

export const AdminPage: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { navigate } = useNavigation();
  const { settings, saveSettings, loading: loadingSettings, error: settingsError } = useStoreSettings();
  const [settingsDraft, setSettingsDraft] = useState<StoreSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => setSettingsDraft(settings), [settings]);

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      await saveSettings(settingsDraft);
      setSettingsSaved(true);
    } catch {
      setSettingsSaved(false);
    } finally {
      setSavingSettings(false);
    }
  };

  // Orders State
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isExportingReceipt, setIsExportingReceipt] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [bulkPdfError, setBulkPdfError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const receiptRef = useRef<HTMLDivElement>(null);

  // Load orders from Firestore
  useEffect(() => {
    if (!isAdmin) return;

    setLoadingOrders(true);
    const ordersRef = collection(db, 'orders');

    // Subscribe to real-time orders snapshot
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const orderList: OrderItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          orderList.push({
            id: d.id,
            orderNumber: data.orderNumber || d.id.slice(0, 8),
            customerName: data.customerName || 'Anonymous',
            customerPhone: data.customerPhone || 'N/A',
            customerAddress: data.customerAddress || 'N/A',
            customerCity: data.customerCity || 'N/A',
            paymentMethod: data.paymentMethod || 'cod',
            paymentProvider: data.paymentProvider,
            totalAmount: data.totalAmount || 500,
            status: data.status || 'pending',
            quantity: data.quantity || 1,
            orderItems: Array.isArray(data.orderItems)
              ? data.orderItems
              : [{ id: 'legacy-shampoo', name: "Patangia's Herbal Shampoo (250 ml)", quantity: data.quantity || 1, price: 700 }],
            deliveryCharge: data.deliveryCharge || 0,
            itemsSubtotal: typeof data.itemsSubtotal === 'number' ? data.itemsSubtotal : undefined,
            bundleDiscount: typeof data.bundleDiscount === 'number' ? data.bundleDiscount : undefined,
            orderNotes: data.orderNotes || '',
            createdAt: data.createdAt || '',
            userId: data.userId,
            userEmail: data.userEmail,
          });
        });

        // Sort latest first
        orderList.sort((a, b) => {
          const dateA = parseOrderDate(a.createdAt)?.getTime() ?? 0;
          const dateB = parseOrderDate(b.createdAt)?.getTime() ?? 0;
          return dateB - dateA;
        });

        setOrders(orderList);
        const currentOrderIds = new Set(orderList.map((order) => order.id));
        setSelectedOrderIds((current) => current.filter((id) => currentOrderIds.has(id)));
        setOrdersError(null);
        setLoadingOrders(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setOrdersError('Orders could not be loaded. Check the Firestore connection and rules.');
        setLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setReviews([]);
      setLoadingReviews(false);
      setReviewsError(null);
      return;
    }

    setLoadingReviews(true);
    setReviewsError(null);
    const customerReviews = query(collection(db, 'productReviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(customerReviews, (snapshot) => {
      const reviewList: ProductReview[] = [];
      snapshot.forEach((reviewDoc) => {
        const data = reviewDoc.data();
        if (
          typeof data.rating === 'number' &&
          Number.isInteger(data.rating) &&
          data.rating >= 1 &&
          data.rating <= 5 &&
          typeof data.comment === 'string'
        ) {
          reviewList.push({
            id: reviewDoc.id,
            orderNumber: typeof data.orderNumber === 'string' ? data.orderNumber : reviewDoc.id,
            displayName: typeof data.displayName === 'string' ? data.displayName : 'Customer',
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt instanceof Timestamp || typeof data.createdAt === 'string'
              ? data.createdAt
              : undefined,
          });
        }
      });
      setReviews(reviewList);
      setLoadingReviews(false);
      setReviewsError(null);
    }, (error) => {
      console.error('Error fetching product reviews:', error);
      const errorCode = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
      setReviewsError(errorCode === 'permission-denied'
        ? 'Review access was denied. Sign in with a configured Firebase admin account and check that the current Firestore rules are published.'
        : 'Reviews could not be loaded. Check the Firestore connection and try again.');
      setLoadingReviews(false);
    });

    return () => unsubscribe();
  }, [isAdmin, reviewsRefreshKey]);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: OrderItem['status']) => {
    setUpdatingId(orderId);
    setStatusUpdateError(null);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
      const errorCode = typeof err === 'object' && err !== null && 'code' in err ? err.code : null;
      setStatusUpdateError(errorCode === 'permission-denied'
        ? 'Order status changes require signing in with a configured Firebase admin account.'
        : 'The order status could not be updated. Check your connection and try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (order: OrderItem) => {
    if (order.status !== 'cancelled') return;
    if (!window.confirm(`Permanently delete cancelled order ${order.orderNumber}? This cannot be undone.`)) return;

    setDeletingId(order.id);
    setDeleteError(null);
    try {
      await deleteDoc(doc(db, 'orders', order.id));
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to delete order', err);
      setDeleteError(`Could not delete order ${order.orderNumber}. Please try again.`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!selectedOrder || !receiptRef.current) return;

    setIsExportingReceipt(true);
    setReceiptError(null);
    try {
      await document.fonts.ready;
      const imageUrl = await toPng(receiptRef.current, {
        backgroundColor: '#ffffff',
        cacheBust: true,
        pixelRatio: 2,
      });
      const downloadLink = document.createElement('a');
      downloadLink.download = `patangia-receipt-${selectedOrder.orderNumber}.png`;
      downloadLink.href = imageUrl;
      downloadLink.click();
    } catch (error) {
      console.error('Failed to export order receipt:', error);
      setReceiptError('Could not create the receipt image. Please try again.');
    } finally {
      setIsExportingReceipt(false);
    }
  };

  const handleDownloadSelectedReceipts = async () => {
    const selectedOrders = orders.filter((order) => selectedOrderIds.includes(order.id));
    if (selectedOrders.length === 0) return;

    setIsExportingPdf(true);
    setBulkPdfError(null);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const right = pageWidth - margin;

      selectedOrders.forEach((order, orderIndex) => {
        if (orderIndex > 0) pdf.addPage();

        pdf.setFillColor(8, 47, 37);
        pdf.rect(0, 0, pageWidth, 34, 'F');
        pdf.setTextColor(252, 224, 130);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(17);
        pdf.text("PATANGIA'S HERBAL", margin, 16);
        pdf.setFontSize(8);
        pdf.setTextColor(237, 245, 239);
        pdf.text('HERBAL CARE · KARACHI', margin, 23);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.text('ORDER RECEIPT', right, 14, { align: 'right' });
        pdf.setFontSize(13);
        pdf.text(order.orderNumber, right, 22, { align: 'right' });

        let y = 44;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(105, 112, 107);
        pdf.text(`Placed: ${formatOrderDateTime(order.createdAt)}`, margin, y);

        y += 13;
        pdf.setDrawColor(221, 225, 221);
        pdf.line(margin, y, right, y);
        y += 9;

        const columnGap = 12;
        const columnWidth = (right - margin - columnGap) / 2;
        const rightColumnX = margin + columnWidth + columnGap;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(125, 132, 126);
        pdf.text('CUSTOMER', margin, y);
        pdf.text('DELIVERY', rightColumnX, y);

        y += 6;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(35, 43, 38);
        pdf.text(pdf.splitTextToSize(order.customerName, columnWidth), margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(75, 82, 77);
        pdf.text(pdf.splitTextToSize(order.customerPhone, columnWidth), margin, y + 6);
        if (order.userEmail) {
          pdf.text(pdf.splitTextToSize(order.userEmail, columnWidth), margin, y + 12);
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(35, 43, 38);
        pdf.text(pdf.splitTextToSize(order.customerCity, columnWidth), rightColumnX, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(75, 82, 77);
        const addressLines = pdf.splitTextToSize(order.customerAddress, columnWidth);
        pdf.text(addressLines, rightColumnX, y + 6);

        const customerLines = order.userEmail ? 3 : 2;
        y += Math.max(customerLines * 5, addressLines.length * 5) + 15;

        pdf.setFillColor(8, 47, 37);
        pdf.rect(margin, y, right - margin, 9, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text('ITEM', margin + 3, y + 6);
        pdf.text('QTY', right - 46, y + 6, { align: 'center' });
        pdf.text('AMOUNT', right - 3, y + 6, { align: 'right' });
        y += 9;

        order.orderItems?.forEach((item, itemIndex) => {
          const itemLines = pdf.splitTextToSize(item.name, right - margin - 64);
          const rowHeight = Math.max(11, itemLines.length * 4.5 + 6);
          if (itemIndex % 2 === 0) {
            pdf.setFillColor(246, 248, 246);
            pdf.rect(margin, y, right - margin, rowHeight, 'F');
          }
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(50, 57, 52);
          pdf.text(itemLines, margin + 3, y + 6);
          pdf.text(String(item.quantity), right - 46, y + 6, { align: 'center' });
          const fallbackLineTotal = item.id === 'patangias-herbal-shampoo'
            ? getBundlePriceForCount(item.quantity)
            : order.orderItems?.length === 1
              ? order.itemsSubtotal ?? Math.max(0, order.totalAmount - (order.deliveryCharge || 0))
              : item.price * item.quantity;
          pdf.text(`Rs. ${(item.lineTotal ?? fallbackLineTotal).toLocaleString()}`, right - 3, y + 6, { align: 'right' });
          y += rowHeight;
        });

        y += 8;
        const deliveryCharge = order.deliveryCharge || 0;
        const discountedSubtotal = order.itemsSubtotal ?? Math.max(0, order.totalAmount - deliveryCharge);
        const bundleSavings = order.bundleDiscount ?? order.orderItems?.reduce((sum, item) => sum + (item.bundleDiscount || 0), 0) ?? 0;
        const originalSubtotal = discountedSubtotal + bundleSavings;
        pdf.setDrawColor(221, 225, 221);
        pdf.line(margin, y, right, y);
        y += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(75, 82, 77);
        pdf.text('Original items subtotal', margin, y);
        pdf.text(`Rs. ${originalSubtotal.toLocaleString()}`, right, y, { align: 'right' });
        y += 7;
        if (bundleSavings > 0) {
          pdf.setTextColor(40, 116, 81);
          pdf.text('Bundle savings', margin, y);
          pdf.text(`- Rs. ${bundleSavings.toLocaleString()}`, right, y, { align: 'right' });
          y += 7;
          pdf.setTextColor(75, 82, 77);
        }
        pdf.text('Delivery', margin, y);
        pdf.text(`Rs. ${deliveryCharge.toLocaleString()}`, right, y, { align: 'right' });
        y += 3;
        pdf.setDrawColor(221, 225, 221);
        pdf.line(margin, y, right, y);
        y += 9;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(8, 47, 37);
        pdf.text('TOTAL PAYABLE', margin, y);
        pdf.text(`Rs. ${order.totalAmount.toLocaleString()}`, right, y, { align: 'right' });

        y += 12;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(75, 82, 77);
        const payment = order.paymentProvider === 'jazzcash'
          ? 'JazzCash'
          : order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer';
        pdf.text(`Payment: ${payment}`, margin, y);
        pdf.text(`Status: ${order.status.toUpperCase()}`, right, y, { align: 'right' });

        if (order.orderNotes) {
          y += 10;
          pdf.setFont('helvetica', 'bold');
          pdf.text('Delivery note', margin, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(pdf.splitTextToSize(order.orderNotes, right - margin), margin, y + 5);
        }

        pdf.setDrawColor(221, 225, 221);
        pdf.line(margin, pageHeight - 20, right, pageHeight - 20);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(125, 132, 126);
        pdf.text(`PATANGIA'S HERBAL · Order ${order.orderNumber}`, pageWidth / 2, pageHeight - 13, { align: 'center' });
      });

      const pdfUrl = URL.createObjectURL(pdf.output('blob'));
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `patangia-receipts-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Failed to create selected order receipts PDF:', error);
      setBulkPdfError('Could not create the selected receipts PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const navigateToSection = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0B3D2E] text-[#FCE082] flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          
          <h2 className="font-serif text-2xl font-bold text-[#0B3D2E]">Admin Portal</h2>
          <p className="text-xs text-stone-600 mt-1 mb-6">
            Sign in with a Google account configured as a store admin to access order management.
          </p>

          <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-[#0B3D2E] px-6 py-3 text-sm font-bold text-white hover:bg-[#07261C]">
            Sign in
          </Link>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-1 text-xs text-stone-500">
            <Link href="/" className="hover:text-[#0B3D2E] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerPhone.includes(searchQuery) ||
      ord.customerCity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReviews = reviews.filter((review) => {
    const search = reviewSearchQuery.trim().toLowerCase();
    return !search ||
      review.displayName.toLowerCase().includes(search) ||
      review.orderNumber.toLowerCase().includes(search) ||
      review.comment.toLowerCase().includes(search);
  });

  const allFilteredOrdersSelected = filteredOrders.length > 0 && filteredOrders.every((order) => selectedOrderIds.includes(order.id));

  const handleToggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((current) => current.includes(orderId)
      ? current.filter((id) => id !== orderId)
      : [...current, orderId]);
  };

  const handleToggleFilteredSelection = () => {
    const visibleIds = new Set(filteredOrders.map((order) => order.id));
    setSelectedOrderIds((current) => allFilteredOrdersSelected
      ? current.filter((id) => !visibleIds.has(id))
      : [...new Set([...current, ...visibleIds])]);
  };

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);
  const totalPending = orders.filter((o) => o.status === 'pending').length;
  const totalDelivered = orders.filter((o) => o.status === 'delivered').length;
  const activeOrders = orders.filter((order) => order.status !== 'cancelled');
  const averageOrderValue = activeOrders.length ? totalRevenue / activeOrders.length : 0;
  const todayOrderCount = orders.filter((order) => {
    const date = parseOrderDate(order.createdAt);
    const today = new Date();
    return date && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  }).length;
  const revenueTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const dayOrders = activeOrders.filter((order) => {
      const orderDate = parseOrderDate(order.createdAt);
      return orderDate && orderDate.getFullYear() === date.getFullYear() && orderDate.getMonth() === date.getMonth() && orderDate.getDate() === date.getDate();
    });

    return {
      day: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
      revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  });
  const statusChartData = ORDER_STATUSES.map((status) => ({
    name: status.label,
    value: orders.filter((order) => order.status === status.value).length,
    color: status.color,
  }));

  return (
    <div className="min-h-screen bg-[#F4F6F3] text-stone-900">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D2E]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-[#0B3D2E]">Store dashboard</span>
        </div>
        <span className="text-[10px] font-semibold text-stone-500">LIVE</span>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#082F25] text-white transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="relative flex h-20 items-center justify-center border-b border-white/10 px-5">
          <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
            <img
              src="/Gemini_Generated_Image_f4gnxvf4gnxvf4gn-removebg-preview.png"
              alt="Patangia's Herbal"
              className="h-11 w-auto max-w-[180px] object-contain"
            />
            <p className="text-[10px] text-emerald-100/70">Store manager</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close admin sidebar"
            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-emerald-50 hover:bg-white/10 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-3 pt-6 text-[10px] font-bold uppercase text-emerald-100/50">Workspace</div>
        <nav aria-label="Admin sections" className="space-y-1 px-3">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            ...(isAdmin ? [{ id: 'reviews', label: 'Reviews', icon: MessageSquare }] : []),
            { id: 'store-settings', label: 'Store settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => navigateToSection(id)}
              aria-current={activeSection === id ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeSection === id ? 'bg-[#C9A227] text-[#082F25]' : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-50/80 transition-colors hover:bg-white/10 hover:text-white">
            <Store className="h-4 w-4" />
            View storefront
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/15 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          {user?.email && <p className="mt-3 truncate px-3 text-[10px] text-emerald-100/50">{user.email}</p>}
        </div>
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section id="overview" className="scroll-mt-24">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <p className="text-xs font-semibold text-stone-500">Store operations / Overview</p>
                <h1 className="mt-1 font-serif text-2xl font-bold text-[#0B3D2E] sm:text-3xl">Dashboard overview</h1>
                <p className="mt-1 text-sm text-stone-600">Live order activity and store performance.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Firestore live sync
              </div>
            </div>

            {ordersError && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{ordersError}</div>}

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500"><span>Total orders</span><Package className="h-4 w-4 text-[#0B3D2E]" /></div>
                <p className="mt-3 text-2xl font-bold text-stone-900">{orders.length.toLocaleString()}</p>
                <p className="mt-1 text-xs text-stone-500">{todayOrderCount} placed today</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500"><span>Net order revenue</span><TrendingUp className="h-4 w-4 text-emerald-700" /></div>
                <p className="mt-3 text-2xl font-bold text-[#0B3D2E]">Rs. {totalRevenue.toLocaleString()}</p>
                <p className="mt-1 text-xs text-stone-500">Excludes cancelled orders</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500"><span>Pending orders</span><Clock className="h-4 w-4 text-amber-700" /></div>
                <p className="mt-3 text-2xl font-bold text-amber-700">{totalPending.toLocaleString()}</p>
                <p className="mt-1 text-xs text-stone-500">Need fulfillment</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500"><span>Average order value</span><DollarSign className="h-4 w-4 text-[#0B3D2E]" /></div>
                <p className="mt-3 text-2xl font-bold text-stone-900">Rs. {Math.round(averageOrderValue).toLocaleString()}</p>
                <p className="mt-1 text-xs text-stone-500">Across active orders</p>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
              <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">Revenue trend</h2>
                    <p className="mt-1 text-xs text-stone-500">Daily revenue · last 7 days</p>
                  </div>
                  <span className="text-xs font-semibold text-stone-500">PKR</span>
                </div>
                <div className="h-64 w-full" role="img" aria-label="Area chart showing daily revenue for the last seven days">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#287451" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#287451" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#E8EBE7" strokeDasharray="3 3" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#787F78', fontSize: 11 }} tickMargin={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#787F78', fontSize: 10 }} tickFormatter={(value) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value))} />
                      <Tooltip formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8, borderColor: '#E5E7EB', fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#287451" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 5, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
                <div className="mb-2">
                  <h2 className="text-sm font-bold text-stone-900">Orders by status</h2>
                  <p className="mt-1 text-xs text-stone-500">Select a status to filter the orders below.</p>
                </div>
                <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(150px,1fr)_minmax(110px,0.85fr)]">
                  <div className="relative h-48 min-w-0" role="img" aria-label="Donut chart showing order counts by status">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={78}
                          paddingAngle={statusChartData.some((entry) => entry.value > 0) ? 3 : 0}
                          stroke="none"
                          onClick={(entry) => {
                            const selectedStatus = ORDER_STATUSES.find((status) => status.label === entry?.name);
                            if (selectedStatus) {
                              setStatusFilter(selectedStatus.value);
                              navigateToSection('orders');
                            }
                          }}
                        >
                          {statusChartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} orders`, 'Count']} contentStyle={{ borderRadius: 8, borderColor: '#E5E7EB', fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <strong className="text-2xl font-bold text-stone-900">{orders.length}</strong>
                      <span className="text-[10px] text-stone-500">orders</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {statusChartData.map((entry) => {
                      const status = ORDER_STATUSES.find((item) => item.label === entry.name);
                      return (
                        <button
                          key={entry.name}
                          type="button"
                          onClick={() => {
                            if (status) {
                              setStatusFilter(status.value);
                              navigateToSection('orders');
                            }
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-xs text-stone-600 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D2E]"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: entry.color }} />
                            <span className="truncate">{entry.name}</span>
                          </span>
                          <strong className="text-stone-900">{entry.value}</strong>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </section>

        <section id="store-settings" className="mb-8 scroll-mt-24 rounded-xl border border-stone-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#0B3D2E]">Store Contact &amp; Payment Details</h2>
              <p className="mt-1 text-xs text-stone-500">Changes update checkout and customer order confirmations.</p>
            </div>
            {!isAdmin && (
              <p className="text-xs text-amber-800">
                <Link href="/login" className="font-bold underline">Sign in</Link> with the verified admin Google account to save.
              </p>
            )}
          </div>
          {settingsError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{settingsError}</p>}
          {settingsSaved && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">Store details saved.</p>}
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-semibold text-stone-700">
              Company WhatsApp number
              <input required maxLength={30} type="tel" value={settingsDraft.whatsappNumber} onChange={(event) => setSettingsDraft({ ...settingsDraft, whatsappNumber: event.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]" />
            </label>
            <label className="text-xs font-semibold text-stone-700">
              JazzCash number
              <input required maxLength={30} type="tel" value={settingsDraft.jazzCashNumber} onChange={(event) => setSettingsDraft({ ...settingsDraft, jazzCashNumber: event.target.value })} className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-normal text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]" />
            </label>
            <div className="flex items-end">
              <button type="submit" disabled={!isAdmin || loadingSettings || savingSettings} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B3D2E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#07261C] disabled:cursor-not-allowed disabled:opacity-50">
                <Save className="h-4 w-4" />
                {savingSettings ? 'Saving...' : loadingSettings ? 'Loading...' : 'Save Details'}
              </button>
            </div>
          </form>
        </section>

        {isAdmin && (
          <section id="reviews" className="mb-8 scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Customer reviews</h2>
                <p className="mt-1 text-xs text-stone-500">Verified feedback from customers with delivered shampoo orders.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {!loadingReviews && !reviewsError && (
                  <span className="text-xs text-stone-500">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    {reviews.length > 0 && ` · ${(reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)} average`}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setReviewsRefreshKey((key) => key + 1)}
                  disabled={loadingReviews}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D2E] disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingReviews ? 'animate-spin' : ''}`} aria-hidden="true" />
                  {loadingReviews ? 'Loading reviews...' : 'Refresh'}
                </button>
              </div>
            </div>

            {reviewsError && (
              <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <span>{reviewsError}</span>
                <button
                  type="button"
                  onClick={() => setReviewsRefreshKey((key) => key + 1)}
                  className="inline-flex min-h-10 shrink-0 items-center rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-900 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                >
                  Try again
                </button>
              </div>
            )}

            <div className="mb-4 flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                value={reviewSearchQuery}
                onChange={(event) => setReviewSearchQuery(event.target.value)}
                placeholder="Search reviews by customer, order number, or words..."
                aria-label="Search customer reviews"
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-500"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              {loadingReviews ? (
                <div className="space-y-3 p-5" role="status" aria-label="Loading customer reviews">
                  <div className="h-4 w-36 animate-pulse rounded bg-stone-100" />
                  <div className="h-16 animate-pulse rounded-lg bg-stone-100" />
                  <div className="h-16 animate-pulse rounded-lg bg-stone-100" />
                </div>
              ) : reviewsError ? (
                <p className="px-5 py-8 text-center text-sm text-stone-600">Review data is unavailable until access is restored.</p>
              ) : filteredReviews.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <MessageSquare className="mx-auto mb-3 h-8 w-8 text-stone-300" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-stone-800">
                    {reviews.length === 0 ? 'No customer reviews yet' : 'No reviews match your search'}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    {reviews.length === 0
                      ? 'Reviews submitted after a shampoo order is delivered will appear here.'
                      : 'Try another customer name, order number, or search term.'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {filteredReviews.map((review) => (
                    <li key={review.id} className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-900">{review.displayName}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            Order <span className="font-semibold text-[#0B3D2E]">{review.orderNumber}</span>
                            {review.createdAt && <> · {formatOrderDateTime(review.createdAt)}</>}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`}
                              aria-hidden="true"
                            />
                          ))}
                          <span className="ml-1 text-xs font-semibold text-stone-700">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        <section id="orders" className="scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Orders</h2>
            <p className="mt-1 text-xs text-stone-500">Search, update fulfillment, and review customer details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-stone-500">{filteredOrders.length} shown · {orders.length} total</span>
            {selectedOrderIds.length > 0 && <span className="text-xs font-semibold text-[#0B3D2E]">{selectedOrderIds.length} selected</span>}
            <button
              type="button"
              onClick={handleDownloadSelectedReceipts}
              disabled={selectedOrderIds.length === 0 || isExportingPdf}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0B3D2E] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#07261C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D2E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
            >
              {isExportingPdf ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {isExportingPdf ? 'Creating PDF...' : 'Download receipts PDF'}
            </button>
          </div>
        </div>

        {bulkPdfError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{bulkPdfError}</p>}

        {/* Filter and Search Bar */}
        <div className="mb-5 flex flex-col items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 md:flex-row">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, Phone, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
            />
          </div>

          {/* Status Filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#0B3D2E] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>

        {/* Orders Table or Grid */}
        {deleteError && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </div>
        )}
        {statusUpdateError && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {statusUpdateError}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0B3D2E]">
              Orders list
            </h2>
            <span className="text-xs text-stone-400">Real-time synced with Firebase Firestore</span>
          </div>

          {loadingOrders ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-[#0B3D2E] animate-spin mx-auto mb-2" />
              <p className="text-xs text-stone-500 font-medium">Loading orders from database...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-base text-stone-700">No Orders Found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                No orders match your filter. Once customers place orders on the checkout page, they will appear here instantly!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">
                      <input
                        type="checkbox"
                        aria-label={`Select all ${filteredOrders.length} filtered orders`}
                        checked={allFilteredOrdersSelected}
                        disabled={filteredOrders.length === 0}
                        onChange={handleToggleFilteredSelection}
                        className="h-4 w-4 rounded border-stone-300 accent-[#0B3D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D2E]"
                      />
                    </th>
                    <th className="py-3 px-4">Order ID &amp; Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">City / Address</th>
                    <th className="py-3 px-4">Bottles</th>
                    <th className="py-3 px-4">Total (PKR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredOrders.map((ord) => {
                    const statusColors: Record<string, string> = {
                      pending: 'bg-amber-100 text-amber-800 border-amber-200',
                      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
                      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
                      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
                    };

                    const cleanPhone = ord.customerPhone.replace(/\D/g, '');
                    const waNumber = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
                    const paymentLabel = ord.paymentProvider === 'jazzcash'
                      ? 'JazzCash'
                      : ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer';
                    const statusLabel = ord.status.charAt(0).toUpperCase() + ord.status.slice(1);
                    const whatsappMessage = [
                      '🌿 Thank You for Your Order! 🌿',
                      '',
                      `Dear ${ord.customerName},`,
                      '',
                      "Thank you for ordering Patangia's Herbal Shampoo. 💚",
                      '',
                      `📦 Order Status: ${statusLabel}`,
                      "🧴 Product: Patangia's Herbal Shampoo",
                      `💰 Payment: ${paymentLabel}`,
                      '',
                      ord.status === 'pending' || ord.status === 'confirmed'
                        ? 'Our team will contact you before dispatch.'
                        : ord.status === 'cancelled'
                          ? 'Please contact us if you have any questions about your order.'
                          : 'Please contact us if you need any assistance with your order.',
                      '',
                      "Thank you for trusting Patangia's. 🌿✨",
                      '',
                      `WhatsApp: ${settings.whatsappNumber}`,
                      "Patangia's Herbal Shampoo",
                    ].join('\n');

                    return (
                      <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            aria-label={`Select order ${ord.orderNumber} for PDF receipt`}
                            checked={selectedOrderIds.includes(ord.id)}
                            onChange={() => handleToggleOrderSelection(ord.id)}
                            className="h-4 w-4 rounded border-stone-300 accent-[#0B3D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D2E]"
                          />
                        </td>
                        {/* Order ID & Date */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0B3D2E]">
                          <div>{ord.orderNumber}</div>
                          <span className="text-[10px] font-sans font-normal text-stone-400">
                            {formatOrderDateTime(ord.createdAt)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4 font-medium">
                          <div className="font-bold text-stone-900">{ord.customerName}</div>
                          {ord.userEmail && (
                            <span className="text-[10px] text-stone-400 block">{ord.userEmail}</span>
                          )}
                        </td>

                        {/* Phone with WhatsApp and Call button */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-900">{ord.customerPhone}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-bold text-[10px]"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                            <a
                              href={`tel:${cleanPhone}`}
                              className="text-blue-700 hover:underline inline-flex items-center gap-1 font-bold text-[10px]"
                            >
                              <Phone className="w-3 h-3" /> Call
                            </a>
                          </div>
                        </td>

                        {/* City & Address */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <span className="font-bold text-stone-900 block">{ord.customerCity}</span>
                          <span className="text-[11px] text-stone-500 truncate block" title={ord.customerAddress}>
                            {ord.customerAddress}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-4 text-xs font-bold text-stone-700">
                          {ord.orderItems?.map((item) => `${item.quantity} x ${item.name}`).join(', ')}
                        </td>

                        {/* Total PKR */}
                        <td className="py-3.5 px-4 font-black text-[#0B3D2E]">
                          Rs. {ord.totalAmount.toLocaleString()}
                          <span className="block text-[10px] font-normal text-stone-400 uppercase">
                            {ord.paymentProvider === 'jazzcash' ? 'JazzCash' : ord.paymentMethod === 'cod' ? 'COD' : 'Bank'}
                          </span>
                        </td>

                        {/* Status selector */}
                        <td className="py-3.5 px-4">
                          <select
                            value={ord.status}
                            disabled={updatingId === ord.id}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value as any)}
                            className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none capitalize ${
                              statusColors[ord.status] || 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Details Modal Trigger */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {ord.status === 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(ord)}
                                disabled={deletingId === ord.id}
                                aria-label={`Delete cancelled order ${ord.orderNumber}`}
                                title={`Delete cancelled order ${ord.orderNumber}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                              >
                                {deletingId === ord.id
                                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                                  : <Trash2 className="h-4 w-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="text-xs font-bold text-[#0B3D2E] hover:underline bg-[#0B3D2E]/10 px-2.5 py-1 rounded-lg"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
        </section>
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl relative animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-[#0B3D2E] uppercase">Order Details</span>
                <h3 className="font-mono text-xl font-black text-stone-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <div ref={receiptRef} className="bg-white px-1 py-5 text-stone-900 sm:px-3">
              <div className="flex items-center justify-between gap-4 border-b-2 border-[#0B3D2E] pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-serif text-lg font-bold text-[#0B3D2E]">PATANGIA'S HERBAL</p>
                    <p className="text-xs text-stone-600">Herbal Care · Karachi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Order Receipt</p>
                  <p className="font-mono text-sm font-bold text-stone-900">{selectedOrder.orderNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-stone-200 py-4 text-xs">
                <div>
                  <p className="mb-1 font-bold uppercase text-stone-500">Customer</p>
                  <p className="font-bold text-stone-900">{selectedOrder.customerName}</p>
                  <p className="mt-0.5 text-stone-700">{selectedOrder.customerPhone}</p>
                  {selectedOrder.userEmail && <p className="mt-0.5 break-all text-stone-700">{selectedOrder.userEmail}</p>}
                </div>
                <div>
                  <p className="mb-1 font-bold uppercase text-stone-500">Delivery</p>
                  <p className="font-bold text-stone-900">{selectedOrder.customerCity}</p>
                  <p className="mt-0.5 text-stone-700">{selectedOrder.customerAddress}</p>
                </div>
              </div>

              <div className="border-b border-stone-200 py-4">
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <span>Items</span>
                  <span>Quantity</span>
                </div>
                <div className="space-y-2 text-xs">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                      <span className="font-medium text-stone-800">{item.name}</span>
                      <span className="shrink-0 font-bold text-stone-900">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-b border-stone-200 py-4 text-xs">
                <div className="flex justify-between gap-4 text-stone-700">
                  <span>Items subtotal</span>
                  <span>Rs. {Math.max(0, selectedOrder.totalAmount - (selectedOrder.deliveryCharge || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-4 text-stone-700">
                  <span>Delivery</span>
                  <span>Rs. {(selectedOrder.deliveryCharge || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-4 pt-2 text-sm font-black text-[#0B3D2E]">
                  <span>Total payable</span>
                  <span>Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-2 pt-4 text-xs">
                <p className="text-stone-700">
                  <span className="font-bold text-stone-500">Payment: </span>
                  {selectedOrder.paymentProvider === 'jazzcash'
                    ? 'JazzCash'
                    : selectedOrder.paymentMethod === 'cod'
                      ? 'Cash on Delivery'
                      : 'Bank Transfer'}
                </p>
                <p className="text-stone-700">
                  <span className="font-bold text-stone-500">Status: </span>
                  <span className="capitalize">{selectedOrder.status}</span>
                </p>
              </div>

              {selectedOrder.orderNotes && (
                <p className="mt-4 border-t border-dashed border-stone-300 pt-3 text-xs text-stone-700">
                  <span className="font-bold">Delivery note: </span>{selectedOrder.orderNotes}
                </p>
              )}

              <p className="mt-6 border-t border-stone-200 pt-3 text-center text-[10px] text-stone-500">
                PATANGIA'S HERBAL · Order {selectedOrder.orderNumber}
              </p>
            </div>

            {receiptError && (
              <p role="alert" className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                {receiptError}
              </p>
            )}

            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                disabled={isExportingReceipt}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B3D2E] px-4 py-2 text-xs font-bold text-white hover:bg-[#07261C] disabled:cursor-wait disabled:opacity-60"
              >
                {isExportingReceipt
                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                  : <Download className="h-4 w-4" />}
                {isExportingReceipt ? 'Preparing PNG...' : 'Download Receipt PNG'}
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
