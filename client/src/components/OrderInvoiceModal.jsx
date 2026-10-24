import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Truck,
  CheckCircle2,
  MapPin,
  Building2,
  FileText,
  Copy,
  Check,
  Edit3,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { businessConfig } from '../config/businessConfig';

/**
 * Procedural SVG Barcode Generator
 * Stretches across full width like commercial shipping labels
 */
function CourierBarcodeSvg({ value, height = 75 }) {
  const text = String(value || 'ZEBA-SHIP').toUpperCase().trim();
  const bars = [3, 1, 1, 2]; // Start guard

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const b1 = (code % 3) + 1.2;
    const s1 = ((code >> 1) % 2) + 1.2;
    const b2 = ((code >> 2) % 3) + 1.6;
    const s2 = ((code >> 3) % 2) + 1.2;
    const b3 = ((code >> 4) % 2) + 1.1;
    const s3 = ((code >> 2) % 3) + 1.3;
    bars.push(b1, s1, b2, s2, b3, s3);
  }
  bars.push(3, 1, 2, 3); // Stop guard

  let totalWidth = 0;
  bars.forEach(w => totalWidth += w);

  let currentX = 6;
  const rects = [];
  bars.forEach((w, idx) => {
    if (idx % 2 === 0) {
      rects.push(
        <rect
          key={idx}
          x={currentX}
          y="0"
          width={w}
          height={height}
          fill="#000000"
        />
      );
    }
    currentX += w;
  });

  return (
    <div className="w-full flex flex-col items-center" style={{ width: '100%', maxWidth: '300px', margin: '0 auto', textAlign: 'center' }}>
      <svg
        viewBox={`0 0 ${currentX + 6} ${height}`}
        className="w-full h-16 sm:h-20"
        style={{ width: '100%', maxWidth: '280px', height: '54px', display: 'block', margin: '0 auto' }}
        preserveAspectRatio="none"
      >
        {rects}
      </svg>
      <span className="font-mono text-xs sm:text-sm tracking-[0.25em] font-black text-black mt-1" style={{ display: 'block', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900, letterSpacing: '2.5px', marginTop: '3px', fontSize: '11px' }}>
        *{text}*
      </span>
    </div>
  );
}

/**
 * Packaging Symbols matching standard courier shipping labels:
 * 1. Broken Wine Glass (Fragile)
 * 2. Flame (Keep away from heat / Flammable)
 * 3. Recycle (Mobius loop)
 * 4. Umbrella (Keep dry)
 */
function FragileGlassIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" width="38" height="38" className={className} fill="currentColor">
      {/* Base */}
      <rect x="28" y="82" width="44" height="6" rx="1" />
      {/* Stem */}
      <rect x="47" y="54" width="6" height="28" />
      {/* Wine glass cup */}
      <path d="M24 16 h52 v16 c0 14 -11 24 -26 24 s-26 -10 -26 -24 Z" />
      {/* Jagged diagonal crack */}
      <path
        d="M50 16 l-7 10 l9 7 l-8 10 l7 9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function FlameIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" width="38" height="38" className={className} fill="currentColor">
      <path d="M50 10 c3 10 -4 18 -10 24 c-7 8 -10 17 -10 27 c0 18 14 31 30 31 s30 -13 30 -31 c0 -14 -9 -25 -20 -34 c0 9 -5 15 -12 18 c0 -12 4 -23 12 -31 c-9 2 -16 7 -20 16 Z" />
    </svg>
  );
}

function RecycleIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" width="38" height="38" className={className} fill="currentColor">
      {/* Mobius 3-arrow chasing loop */}
      <path d="M50 8 L38 24 H47 V34 H53 V24 H62 Z" />
      <path d="M22 62 L10 44 L24 40 L22 45 L31 50 L29 54 L20 49 Z" />
      <path d="M26 68 L36 50 L40 52 L32 66 L44 66 L44 71 L26 71 Z" />
      <path d="M78 62 L69 49 L60 54 L58 50 L67 45 L65 40 L79 44 Z" />
      <path d="M74 68 L56 71 L56 66 L68 66 L60 52 L64 50 Z" />
    </svg>
  );
}

function UmbrellaIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" width="38" height="38" className={className} fill="currentColor">
      {/* Canopy */}
      <path d="M50 16 C30 16 16 30 16 48 h9 c0 -2.5 2 -4.5 4.5 -4.5 s4.5 2 4.5 4.5 h9 c0 -2.5 2 -4.5 4.5 -4.5 s4.5 2 4.5 4.5 h9 c0 -2.5 2 -4.5 4.5 -4.5 s4.5 2 4.5 4.5 h9 c0 -2.5 2 -4.5 4.5 -4.5 s4.5 2 4.5 4.5 h9 C84 30 70 16 50 16 Z" />
      {/* Handle stick and J hook */}
      <path d="M47 48 v26 c0 3.8 -3.2 7 -7 7 s-7 -3.2 -7 -7 h-5 c0 6.6 5.4 12 12 12 s12 -5.4 12 -12 V48 h-5 Z" />
    </svg>
  );
}

/**
 * Converts a numeric amount to Indian Rupee Words format
 */
function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n < 20) return teens[n - 10];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + singleDigits[unit] : '');
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += singleDigits[hundred] + ' Hundred';
      if (rest > 0) res += ' and ';
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  const crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  const hundred = remainder;

  let words = '';
  if (crore > 0) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (hundred > 0) words += convertThreeDigits(hundred) + ' ';

  return words.trim() + ' Rupees Only';
}

export default function OrderInvoiceModal({
  order,
  courierPartner: initialCourier = '',
  trackingNumber: initialTracking = '',
  estimatedDeliveryDate: initialDeliveryDate = '',
  settings = {},
  isOpen,
  onClose
}) {
  // Default to the exact courier shipping label requested
  const [activeTab, setActiveTab] = useState('courier_label'); // 'courier_label' | 'full_invoice'
  const [paperSize, setPaperSize] = useState('a4'); // 'a4' (Standard DeskJet / Office Printer) | 'label_4x6' (Thermal 100x150mm)
  
  // Product barcodes list discovered from ordered items or catalog
  const [productBarcodes, setProductBarcodes] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Barcode state - initialized with product barcode first
  const [barcodeDetails, setBarcodeDetails] = useState('');
  const [barcodeImage, setBarcodeImage] = useState(null);
  
  // Logo display choice: 'ZEBA' (ZE/BA) or 'LOGO' (LO/GO)
  const [logoStyle, setLogoStyle] = useState('ZEBA'); // 'ZEBA' | 'LOGO'

  // Editable Sender Details
  const defaultShopName = settings?.brandFullName || settings?.brandName || businessConfig.brandFullName || 'ZEBA Wellness';
  const defaultFromAddr = `${settings?.address?.building || businessConfig.address.building}, ${settings?.address?.street || businessConfig.address.street}`;
  const defaultFromCityState = `${settings?.address?.city || businessConfig.address.city}, ${settings?.address?.state || businessConfig.address.state} ${settings?.address?.pincode || businessConfig.address.pincode}`;
  const defaultFromPhone = settings?.supportPhone || businessConfig.supportPhone;

  const [fromShop, setFromShop] = useState(defaultShopName);
  const [fromAddress, setFromAddress] = useState(defaultFromAddr);
  const [fromCityZip, setFromCityZip] = useState(defaultFromCityState);
  const [fromPhone, setFromPhone] = useState(defaultFromPhone);

  // Editable Recipient Details
  const defaultToName = order?.customer_name || 'Customer';
  const defaultToAddr = [order?.house_building, order?.street, order?.area].filter(Boolean).join(', ');
  const defaultToCityZip = `${order?.city ? order.city + ', ' : ''}${order?.state ? order.state + ' - ' : ''}${order?.pincode || ''}`;
  const defaultToPhone = order?.customer_phone || '';

  const [toName, setToName] = useState(defaultToName);
  const [toAddress, setToAddress] = useState(defaultToAddr);
  const [toCityZip, setToCityZip] = useState(defaultToCityZip);
  const [toPhone, setToPhone] = useState(defaultToPhone);

  // Edit drawer toggle
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  const printableAreaRef = useRef(null);

  // Synchronize and resolve product barcode and barcode image from product catalog
  useEffect(() => {
    let isMounted = true;

    async function resolveBarcodeAndData() {
      if (!order) return;

      setToName(order.customer_name || 'Customer');
      setToAddress([order.house_building, order.street, order.area].filter(Boolean).join(', '));
      setToCityZip(`${order.city ? order.city + ', ' : ''}${order.state ? order.state + ' - ' : ''}${order.pincode || ''}`);
      setToPhone(order.customer_phone || '');

      try {
        // Fetch fresh product catalog to always get real-time barcode_image uploaded in the product page
        const res = await api.get('/admin/products');
        const prods = (res.success && Array.isArray(res.products)) ? res.products : [];
        if (isMounted) {
          setCatalogProducts(prods);
        }

        const discoveredList = [];

        // 1. First match against products ordered in this order
        (order.items || []).forEach(item => {
          const matched = catalogProducts.find(p =>
            p.id === item.product_id ||
            (p.name && item.product_name && p.name.trim().toLowerCase() === item.product_name.trim().toLowerCase()) ||
            (p.pack_size && item.pack_size && p.pack_size.trim().toLowerCase() === item.pack_size.trim().toLowerCase()) ||
            (p.pack_size && item.product_name && item.product_name.toLowerCase().includes(p.pack_size.toLowerCase())) ||
            (p.name && item.product_name && item.product_name.toLowerCase().includes(p.name.toLowerCase()))
          );

          const code = matched?.barcode || item.barcode || '';
          const img = matched?.barcode_image || item.barcode_image || null;

          if ((code || img) && !discoveredList.some(b => b.code === code && b.barcode_image === img)) {
            discoveredList.push({
              label: matched?.pack_size || matched?.name || item.pack_size || item.product_name || 'Product',
              code,
              barcode_image: img
            });
          }
        });

        // 2. If no direct item matches, include all available catalog products that have barcodes/images
        if (catalogProducts.length > 0) {
          catalogProducts.forEach(p => {
            if ((p.barcode || p.barcode_image) && !discoveredList.some(b => b.barcode_image === p.barcode_image && b.code === p.barcode)) {
              discoveredList.push({
                label: p.pack_size || p.name,
                code: p.barcode || '',
                barcode_image: p.barcode_image || null
              });
            }
          });
        }

        if (isMounted) {
          setProductBarcodes(discoveredList);
          if (discoveredList.length > 0) {
            setBarcodeDetails(discoveredList[0].code || '');
            setBarcodeImage(discoveredList[0].barcode_image || null);
          } else {
            setBarcodeDetails(initialTracking || order.tracking_number || order.order_number || '');
            setBarcodeImage(null);
          }
        }
      } catch (err) {
        console.warn('Could not fetch product barcodes:', err.message);
        // Fallback to order items
        const directList = [];
        (order.items || []).forEach(it => {
          if (it.barcode || it.barcode_image) {
            directList.push({
              label: it.pack_size || it.product_name,
              code: it.barcode || '',
              barcode_image: it.barcode_image || null
            });
          }
        });
        if (isMounted) {
          setProductBarcodes(directList);
          if (directList.length > 0) {
            setBarcodeDetails(directList[0].code || '');
            setBarcodeImage(directList[0].barcode_image || null);
          }
        }
      }
    }

    resolveBarcodeAndData();

    return () => { isMounted = false; };
  }, [order, initialTracking]);

  if (!isOpen || !order) return null;

  const orderNumber = order.order_number || `ZEBA-${order.id}`;
  const invoiceNumber = `INV-${orderNumber}`;
  const isPrepaid = (order.payment_status || '').toLowerCase() === 'paid';
  const totalAmount = parseFloat(order.total_amount || 0);
  const subtotal = parseFloat(order.subtotal || totalAmount);
  const shippingFee = parseFloat(order.shipping_fee || 0);
  const discountAmount = parseFloat(order.discount_amount || 0);
  const gstRate = settings?.tax?.gstPercentage || businessConfig.tax.gstPercentage || 18;
  const taxableValue = subtotal / (1 + gstRate / 100);
  const totalGst = subtotal - taxableValue;

  const orderDateFormatted = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

  // Filter out dummy/placeholder test IDs so only authentic regulatory data is shown
  const isDummyTaxId = (val) => {
    if (!val) return true;
    const str = String(val).toUpperCase().trim();
    return str === 'AAACZ1234F' || str.includes('1234') || str === 'XXXXX0000X';
  };

  const realPan = !isDummyTaxId(settings?.tax?.pan) ? settings?.tax?.pan : (!isDummyTaxId(businessConfig?.tax?.pan) ? businessConfig.tax.pan : null);
  const realGstin = !isDummyTaxId(settings?.tax?.gstin) ? settings?.tax?.gstin : null;

  const shopBrandTitle = fromShop.toLowerCase().includes('period care')
    ? fromShop.replace(/period\s*care/i, '').trim()
    : fromShop;

  const handleCopyBarcode = () => {
    if (barcodeDetails) {
      navigator.clipboard.writeText(barcodeDetails);
      setCopiedBarcode(true);
      setTimeout(() => setCopiedBarcode(false), 2000);
    }
  };

  /**
   * Print Handler:
   * Opens clean printable window with crisp, self-contained vector styles
   * Guarantees exact 1-page fit for HP DeskJet/A4 paper and 4x6 thermal labels
   */
  const handlePrint = () => {
    const printContent = printableAreaRef.current;
    if (!printContent) return;

    const isLabel = activeTab === 'courier_label';
    const docTitle = isLabel 
      ? `Shipping_Label_${barcodeDetails || orderNumber}`
      : `Tax_Invoice_${invoiceNumber}`;

    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      window.print();
      return;
    }

    // Capture parent document styles if present
    const parentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => node.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${docTitle}</title>
          ${parentStyles}
          <style>
            *, *::before, *::after {
              box-sizing: border-box !important;
              margin: 0;
              padding: 0;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              line-height: 1.25 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: ${isLabel ? (paperSize === 'label_4x6' ? '100mm 150mm' : 'A4 portrait') : 'A4 portrait'};
              margin: ${isLabel ? (paperSize === 'label_4x6' ? '3mm' : '8mm') : '8mm'};
            }
            .label-print-wrapper {
              width: 100% !important;
              margin: 0 auto !important;
              background: #ffffff !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: flex-start !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            /* COURIER LABEL ROOT CARD */
            .courier-label-card {
              width: 100% !important;
              max-width: ${paperSize === 'label_4x6' ? '94mm' : '102mm'} !important;
              height: ${paperSize === 'label_4x6' ? '142mm' : '144mm'} !important;
              max-height: ${paperSize === 'label_4x6' ? '142mm' : '144mm'} !important;
              background-color: #ffffff !important;
              border: 3px solid #000000 !important;
              border-radius: 18px !important;
              padding: 8px !important;
              display: flex !important;
              flex-direction: column !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              margin: ${paperSize === 'label_4x6' ? '0 auto' : '4mm auto 0 auto'} !important;
            }

            /* INNER RECTANGULAR BLACK FRAME */
            .courier-label-inner {
              border: 2.5px solid #000000 !important;
              border-radius: 0 !important;
              padding: 10px 12px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              height: 100% !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
            }

            /* TOP ROW: LOGO + FROM ADDRESS */
            .courier-top-row {
              display: flex !important;
              flex-direction: row !important;
              align-items: flex-start !important;
              justify-content: space-between !important;
              gap: 12px !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }

            .courier-logo-box {
              width: 58px !important;
              height: 58px !important;
              min-width: 58px !important;
              min-height: 58px !important;
              background-color: #000000 !important;
              color: #ffffff !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              font-weight: 900 !important;
              font-size: 19px !important;
              line-height: 1 !important;
              letter-spacing: 2px !important;
              border-radius: 2px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              flex-shrink: 0 !important;
              user-select: none !important;
            }

            .courier-logo-box span {
              color: #ffffff !important;
              display: block !important;
              line-height: 1 !important;
            }

            .courier-from-col {
              flex: 1 !important;
              display: flex !important;
              flex-direction: row !important;
              align-items: flex-start !important;
              gap: 8px !important;
              min-width: 0 !important;
            }

            .courier-field-label {
              font-weight: 900 !important;
              font-size: 13px !important;
              text-transform: uppercase !important;
              letter-spacing: 0.5px !important;
              color: #000000 !important;
              white-space: nowrap !important;
              padding-top: 1px !important;
              flex-shrink: 0 !important;
            }

            .courier-address-content {
              font-size: 11.5px !important;
              line-height: 1.25 !important;
              color: #000000 !important;
              flex: 1 !important;
              min-width: 0 !important;
            }

            .courier-address-content .addr-name {
              font-weight: 900 !important;
              font-size: 13.5px !important;
              text-transform: uppercase !important;
              margin-bottom: 2px !important;
              color: #000000 !important;
              word-break: break-word !important;
            }

            .courier-address-content .addr-line {
              font-weight: 500 !important;
              font-size: 11px !important;
              color: #111111 !important;
              margin-bottom: 1px !important;
              word-break: break-word !important;
            }

            .courier-address-content .addr-city {
              font-weight: 700 !important;
              font-size: 12px !important;
              margin-bottom: 1px !important;
              color: #000000 !important;
            }

            .courier-address-content .addr-phone {
              font-weight: 600 !important;
              font-size: 11px !important;
              color: #222222 !important;
            }

            /* HORIZONTAL DIVIDERS */
            .courier-divider-line {
              border-bottom: 2.5px solid #000000 !important;
              width: 100% !important;
              margin: 5px 0 !important;
              flex-shrink: 0 !important;
            }

            /* TO ROW */
            .courier-to-row {
              display: flex !important;
              flex-direction: row !important;
              align-items: flex-start !important;
              gap: 12px !important;
              width: 100% !important;
              padding: 1px 0 !important;
              box-sizing: border-box !important;
            }

            .courier-to-row .addr-name {
              font-weight: 900 !important;
              font-size: 15px !important;
              text-transform: uppercase !important;
              letter-spacing: 0.3px !important;
              margin-bottom: 2px !important;
              color: #000000 !important;
            }

            .courier-to-row .addr-city {
              font-weight: 900 !important;
              font-size: 13px !important;
              color: #000000 !important;
            }

            .courier-to-row .addr-phone {
              font-weight: 900 !important;
              font-size: 12px !important;
              color: #000000 !important;
            }

            /* BARCODE SECTION */
            .courier-barcode-wrapper {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              width: 100% !important;
              padding: 3px 0 !important;
              min-height: 65px !important;
              max-height: 80px !important;
              overflow: hidden !important;
              flex-shrink: 0 !important;
              text-align: center !important;
            }

            .courier-barcode-img {
              max-height: 60px !important;
              max-width: 280px !important;
              width: auto !important;
              height: auto !important;
              object-fit: contain !important;
              display: block !important;
              margin: 0 auto !important;
            }

            /* DOUBLE DIVIDER */
            .courier-double-divider {
              width: 100% !important;
              margin: 4px 0 !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 2px !important;
              flex-shrink: 0 !important;
            }

            .courier-double-divider .line {
              height: 2px !important;
              background-color: #000000 !important;
              width: 100% !important;
            }

            /* PACKAGING SYMBOLS */
            .courier-symbols-row {
              display: flex !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-around !important;
              width: 100% !important;
              padding: 2px 0 0 0 !important;
              color: #000000 !important;
              flex-shrink: 0 !important;
            }

            .courier-symbol-item {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              width: 38px !important;
              height: 38px !important;
            }

            .courier-symbol-item svg {
              width: 36px !important;
              height: 36px !important;
              max-width: 36px !important;
              max-height: 36px !important;
              display: block !important;
              fill: currentColor !important;
            }

            .courier-cut-guide {
              margin-top: 4mm !important;
              font-size: 10px !important;
              color: #666666 !important;
              text-align: center !important;
              letter-spacing: 0.5px !important;
            }

            /* TAX INVOICE */
            .tax-invoice-card {
              width: 100% !important;
              max-width: 190mm !important;
              background-color: #ffffff !important;
              color: #111827 !important;
              font-size: 11px !important;
              line-height: 1.35 !important;
              margin: 0 auto !important;
              padding: 4mm !important;
              box-sizing: border-box !important;
              border: 1px solid #d1d5db !important;
              border-radius: 8px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .tax-invoice-table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 8px 0 !important;
              font-size: 10px !important;
            }

            .tax-invoice-table th, .tax-invoice-table td {
              border: 1px solid #d1d5db !important;
              padding: 5px 6px !important;
            }

            .tax-invoice-table th {
              background-color: #f3f4f6 !important;
              font-weight: 700 !important;
              text-transform: uppercase !important;
              font-size: 9px !important;
            }

            @media print {
              body {
                background: #ffffff !important;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-print-wrapper">
            ${printContent.innerHTML}
          </div>
          <script>
            (function() {
              function doPrint() {
                try {
                  window.focus();
                  window.print();
                } catch(e) {
                  console.error(e);
                }
              }

              window.onafterprint = function() {
                try { window.close(); } catch(e) {}
              };

              var imgs = Array.from(document.images);
              if (imgs.length === 0) {
                setTimeout(doPrint, 250);
              } else {
                var loaded = 0;
                var total = imgs.length;
                var timer = setTimeout(doPrint, 1200);

                imgs.forEach(function(img) {
                  if (img.complete) {
                    loaded++;
                    if (loaded >= total) {
                      clearTimeout(timer);
                      setTimeout(doPrint, 200);
                    }
                  } else {
                    img.onload = img.onerror = function() {
                      loaded++;
                      if (loaded >= total) {
                        clearTimeout(timer);
                        setTimeout(doPrint, 200);
                      }
                    };
                  }
                });
              }
            })();
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-brand-primaryPink/30 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-deepPurple via-brand-plum to-brand-deepPurple text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-white/10 text-brand-gold">
                <Truck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display font-bold text-lg text-white tracking-wide">
                  Courier Shipping Label & Invoice
                </h3>
                <p className="text-xs text-white/80">
                  Order <span className="font-mono font-bold text-brand-gold">{orderNumber}</span> • Standard Courier Dispatch Format
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Print Action */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-brand-brightPink/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Label</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Bar */}
        <div className="p-3 bg-brand-softPink/40 border-b border-brand-primaryPink/20 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-brand-primaryPink/30">
              <button
                onClick={() => setActiveTab('courier_label')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'courier_label'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-brand-dark hover:bg-brand-softPink'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Courier Label (Reference Style)</span>
              </button>
              <button
                onClick={() => setActiveTab('full_invoice')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'full_invoice'
                    ? 'bg-brand-plum text-white shadow-sm'
                    : 'text-brand-dark hover:bg-brand-softPink'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Tax Invoice (A4 GST)</span>
              </button>
            </div>

            {/* Paper Size selector for Courier Label */}
            {activeTab === 'courier_label' && (
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-brand-primaryPink/30 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-500 pl-1.5 pr-0.5">Paper:</span>
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    paperSize === 'a4'
                      ? 'bg-brand-plum text-white shadow-xs'
                      : 'text-gray-700 hover:bg-brand-softPink'
                  }`}
                  title="Optimized for standard A4 desktop printers (HP DeskJet, Laser, etc.)"
                >
                  A4 (HP DeskJet)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('label_4x6')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    paperSize === 'label_4x6'
                      ? 'bg-brand-plum text-white shadow-xs'
                      : 'text-gray-700 hover:bg-brand-softPink'
                  }`}
                  title="Optimized for 4x6 inch (100x150mm) Thermal Label Sticker rolls"
                >
                  4" × 6" Sticker
                </button>
              </div>
            )}
          </div>

          {/* Quick Buttons for Logo & Meta Customizer */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setLogoStyle(prev => prev === 'ZEBA' ? 'LOGO' : 'ZEBA')}
              className="px-2.5 py-1 rounded-lg bg-white border border-brand-primaryPink/30 text-brand-dark font-semibold text-[11px] hover:border-brand-brightPink transition-colors cursor-pointer"
              title="Toggle Logo text"
            >
              Logo: <strong className="font-mono">{logoStyle === 'ZEBA' ? 'ZE / BA' : 'LO / GO'}</strong>
            </button>

            <button
              type="button"
              onClick={() => setShowEditDrawer(prev => !prev)}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer ${
                showEditDrawer
                  ? 'bg-brand-plum text-white'
                  : 'bg-white border border-brand-primaryPink/30 text-brand-dark hover:border-brand-brightPink'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* PRODUCT BARCODE IMAGE BAR */}
        <div className="p-3 bg-yellow-50/90 border-b border-yellow-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-900 shrink-0 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Barcode Image:</span>
            </span>
            {barcodeImage ? (
              <div className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-xl border border-yellow-300 shadow-xs">
                <img src={barcodeImage} alt="Product Barcode Graphic" className="h-6 max-w-[90px] object-contain" />
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Product Page Barcode Image Active
                </span>
              </div>
            ) : (
              <span className="text-xs text-amber-800 font-medium">
                No barcode image uploaded in Product Page (Upload in Admin Catalog)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] flex-wrap gap-y-1">
            {productBarcodes.map((pb, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setBarcodeDetails(pb.code);
                  setBarcodeImage(pb.barcode_image || null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  barcodeImage === pb.barcode_image
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                    : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                }`}
                title={`Use Barcode for ${pb.label}`}
              >
                <span>📦 {pb.label}</span>
                {pb.barcode_image ? (
                  <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">Image</span>
                ) : (
                  <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded">No Image</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Edit Drawer for FROM / TO fields */}
        {showEditDrawer && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in slide-in-from-top-2 duration-150 shrink-0">
            {/* FROM Details */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <span className="font-black uppercase text-gray-700 block text-[11px]">FROM (Sender Shop):</span>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold">Shop Name</label>
                <input
                  type="text"
                  value={fromShop}
                  onChange={(e) => setFromShop(e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold">Street Address</label>
                <input
                  type="text"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold">City, State ZIP / Pincode</label>
                <input
                  type="text"
                  value={fromCityZip}
                  onChange={(e) => setFromCityZip(e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold">Phone (Optional)</label>
                <input
                  type="text"
                  value={fromPhone}
                  onChange={(e) => setFromPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-xs font-medium"
                />
              </div>
            </div>

            {/* TO Details */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <span className="font-black uppercase text-gray-700 block text-[11px]">TO (Customer):</span>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold">Customer Name</label>
                <input
                  type="text"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold">Delivery Address</label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold">City, State - PINCODE</label>
                <input
                  type="text"
                  value={toCityZip}
                  onChange={(e) => setToCityZip(e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold">Phone</label>
                <input
                  type="text"
                  value={toPhone}
                  onChange={(e) => setToPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded p-1 text-xs font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/70 flex justify-center items-start">
          
          <div ref={printableAreaRef} className="w-full flex justify-center">

            {activeTab === 'courier_label' ? (
              /* ========================================================================= */
              /* EXACT COURIER SHIPPING LABEL (Matches Reference & Prints on 1 Page)       */
              /* ========================================================================= */
              <div className="flex flex-col items-center">
                <div
                  className="courier-label-card bg-white p-2.5 sm:p-3 rounded-3xl border-[3px] border-black shadow-xl w-full text-black font-sans leading-snug"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '3px solid #000000',
                    borderRadius: '18px',
                    padding: '8px',
                    boxSizing: 'border-box',
                    maxWidth: paperSize === 'label_4x6' ? '400px' : '420px',
                    width: '100%'
                  }}
                >
                  {/* Inner Black Rectangular Frame */}
                  <div
                    className="courier-label-inner border-[2.5px] border-black p-3 sm:p-4 bg-white flex flex-col justify-between h-full space-y-2.5"
                    style={{
                      border: '2.5px solid #000000',
                      borderRadius: '0px',
                      padding: '10px 12px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box'
                    }}
                  >
                    
                    {/* TOP ROW: LOGO SQUARE + FROM ADDRESS */}
                    <div
                      className="courier-top-row flex items-start justify-between gap-3"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      
                      {/* Left Square Black Box with White Centered Text */}
                      <div
                        className="courier-logo-box w-14 h-14 sm:w-16 sm:h-16 bg-black text-white flex flex-col items-center justify-center font-black text-lg sm:text-xl leading-none tracking-widest rounded-xs shrink-0 select-none"
                        style={{
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          width: '58px',
                          height: '58px',
                          minWidth: '58px',
                          minHeight: '58px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '19px',
                          lineHeight: 1,
                          letterSpacing: '2px',
                          borderRadius: '2px',
                          flexShrink: 0,
                          userSelect: 'none',
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact'
                        }}
                      >
                        {logoStyle === 'ZEBA' ? (
                          <>
                            <span style={{ color: '#ffffff', lineHeight: 1 }}>ZE</span>
                            <span style={{ color: '#ffffff', lineHeight: 1, marginTop: '2px' }}>BA</span>
                          </>
                        ) : (
                          <>
                            <span style={{ color: '#ffffff', lineHeight: 1 }}>LO</span>
                            <span style={{ color: '#ffffff', lineHeight: 1, marginTop: '2px' }}>GO</span>
                          </>
                        )}
                      </div>

                      {/* FROM: Sender Store Information */}
                      <div
                        className="courier-from-col flex-1 flex items-start space-x-2.5 sm:space-x-3 pl-1 min-w-0"
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: '8px',
                          flex: 1,
                          minWidth: 0
                        }}
                      >
                        <span
                          className="courier-field-label font-black text-xs sm:text-sm uppercase tracking-wider text-black pt-0.5 select-none shrink-0"
                          style={{
                            fontWeight: 900,
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: '#000000',
                            whiteSpace: 'nowrap',
                            paddingTop: '1px',
                            flexShrink: 0
                          }}
                        >
                          FROM :
                        </span>
                        <div
                          className="courier-address-content text-xs sm:text-sm font-bold text-black leading-snug space-y-0.5 flex-1 min-w-0"
                          style={{
                            fontSize: '11.5px',
                            lineHeight: 1.25,
                            color: '#000000',
                            flex: 1,
                            minWidth: 0
                          }}
                        >
                          <p
                            className="addr-name font-black text-xs sm:text-sm uppercase tracking-tight"
                            style={{
                              fontWeight: 900,
                              fontSize: '13.5px',
                              textTransform: 'uppercase',
                              marginBottom: '2px',
                              color: '#000000',
                              wordBreak: 'break-word'
                            }}
                          >
                            {fromShop}
                          </p>
                          <p
                            className="addr-line font-medium text-gray-900"
                            style={{
                              fontWeight: 500,
                              fontSize: '11px',
                              color: '#111111',
                              marginBottom: '1px',
                              wordBreak: 'break-word'
                            }}
                          >
                            {fromAddress}
                          </p>
                          <p
                            className="addr-city font-bold"
                            style={{
                              fontWeight: 700,
                              fontSize: '12px',
                              marginBottom: '1px',
                              color: '#000000'
                            }}
                          >
                            {fromCityZip}
                          </p>
                          {fromPhone && (
                            <p
                              className="addr-phone text-[11px] font-semibold text-gray-700"
                              style={{
                                fontWeight: 600,
                                fontSize: '11px',
                                color: '#222222',
                                margin: 0
                              }}
                            >
                              Ph: {fromPhone}
                            </p>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* THICK DIVIDER LINE 1 */}
                    <div
                      className="courier-divider-line border-b-[2.5px] border-black w-full my-1"
                      style={{
                        borderBottom: '2.5px solid #000000',
                        width: '100%',
                        margin: '5px 0',
                        flexShrink: 0
                      }}
                    ></div>

                    {/* MIDDLE ROW: TO: RECIPIENT INFORMATION */}
                    <div
                      className="courier-to-row flex items-start space-x-2.5 sm:space-x-4 pl-1 py-0.5"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: '10px',
                        width: '100%',
                        padding: '1px 0',
                        boxSizing: 'border-box'
                      }}
                    >
                      <span
                        className="courier-field-label font-black text-xs sm:text-sm uppercase tracking-wider text-black pt-0.5 select-none shrink-0"
                        style={{
                          fontWeight: 900,
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: '#000000',
                          whiteSpace: 'nowrap',
                          paddingTop: '1px',
                          flexShrink: 0
                        }}
                      >
                        TO :
                      </span>
                      <div
                        className="courier-address-content text-xs sm:text-sm font-bold text-black leading-snug space-y-0.5 flex-1 min-w-0"
                        style={{
                          fontSize: '11.5px',
                          lineHeight: 1.25,
                          color: '#000000',
                          flex: 1,
                          minWidth: 0
                        }}
                      >
                        <p
                          className="addr-name font-black text-sm sm:text-base uppercase tracking-wide text-black"
                          style={{
                            fontWeight: 900,
                            fontSize: '15px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            marginBottom: '2px',
                            color: '#000000'
                          }}
                        >
                          {toName}
                        </p>
                        <p
                          className="addr-line font-medium text-gray-900"
                          style={{
                            fontWeight: 500,
                            fontSize: '11.5px',
                            color: '#111111',
                            marginBottom: '1px',
                            wordBreak: 'break-word'
                          }}
                        >
                          {toAddress}
                        </p>
                        <p
                          className="addr-city font-black text-xs sm:text-sm"
                          style={{
                            fontWeight: 900,
                            fontSize: '13px',
                            marginBottom: '1px',
                            color: '#000000'
                          }}
                        >
                          {toCityZip}
                        </p>
                        {toPhone && (
                          <p
                            className="addr-phone text-xs sm:text-sm font-black text-black pt-0.5"
                            style={{
                              fontWeight: 900,
                              fontSize: '12px',
                              color: '#000000',
                              margin: 0
                            }}
                          >
                            Ph: {toPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* THICK DIVIDER LINE 2 */}
                    <div
                      className="courier-divider-line border-b-[2.5px] border-black w-full my-1"
                      style={{
                        borderBottom: '2.5px solid #000000',
                        width: '100%',
                        margin: '5px 0',
                        flexShrink: 0
                      }}
                    ></div>

                    {/* BARCODE SECTION: Real Barcode Image from Product Page or Clean Fallback */}
                    <div
                      className="courier-barcode-wrapper py-1.5 px-2 w-full flex flex-col items-center justify-center min-h-[65px]"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        padding: '3px 0',
                        minHeight: '65px',
                        maxHeight: '80px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        textAlign: 'center'
                      }}
                    >
                      {barcodeImage ? (
                        <div className="flex flex-col items-center justify-center max-w-full">
                          <img
                            src={barcodeImage}
                            alt="Barcode Graphic from Product Page"
                            className="courier-barcode-img max-h-16 max-w-[280px] w-auto object-contain block mx-auto"
                            style={{
                              maxHeight: '60px',
                              maxWidth: '280px',
                              width: 'auto',
                              height: 'auto',
                              objectFit: 'contain',
                              display: 'block',
                              margin: '0 auto'
                            }}
                          />
                        </div>
                      ) : barcodeDetails ? (
                        <CourierBarcodeSvg value={barcodeDetails} height={50} />
                      ) : (
                        <div className="py-2 px-3 text-center border border-dashed border-gray-400 rounded-lg w-full max-w-xs bg-gray-50/60">
                          <p className="text-xs font-bold text-gray-700">No Barcode Image</p>
                          <p className="text-[10px] text-gray-500">Upload a barcode image in Admin Product Catalog</p>
                        </div>
                      )}
                    </div>

                    {/* DOUBLE HORIZONTAL LINE DIVIDER */}
                    <div
                      className="courier-double-divider space-y-0.5 my-0.5 w-full"
                      style={{
                        width: '100%',
                        margin: '4px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        flexShrink: 0
                      }}
                    >
                      <div className="line h-[2px] bg-black w-full" style={{ height: '2px', backgroundColor: '#000000', width: '100%' }}></div>
                      <div className="line h-[2px] bg-black w-full" style={{ height: '2px', backgroundColor: '#000000', width: '100%' }}></div>
                    </div>

                    {/* BOTTOM ROW: 4 ICONIC PACKAGING SYMBOLS */}
                    <div
                      className="courier-symbols-row flex items-center justify-around py-1.5 px-2 text-black"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        width: '100%',
                        padding: '2px 0 0 0',
                        color: '#000000',
                        flexShrink: 0
                      }}
                    >
                      <div className="courier-symbol-item" title="Fragile / Handle With Care" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px' }}>
                        <FragileGlassIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                      </div>
                      <div className="courier-symbol-item" title="Keep Away From Fire / Heat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px' }}>
                        <FlameIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                      </div>
                      <div className="courier-symbol-item" title="Recyclable Packaging" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px' }}>
                        <RecycleIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                      </div>
                      <div className="courier-symbol-item" title="Keep Dry / Protect From Moisture" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px' }}>
                        <UmbrellaIcon className="w-8 h-8 sm:w-9 sm:h-9" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Subtle Cut Guide when on A4 format */}
                {paperSize === 'a4' && (
                  <div
                    className="courier-cut-guide text-center text-[10px] text-gray-500 mt-2"
                    style={{
                      textAlign: 'center',
                      fontSize: '10px',
                      color: '#666666',
                      marginTop: '6px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    ✂ Cut along outer rounded border to affix on parcel box (Single Sheet Guaranteed)
                  </div>
                )}
              </div>
            ) : (
              /* ========================================================================= */
              /* FULL TAX INVOICE (A4 GST COMPLIANT FOR ACCOUNTING)                        */
              /* ========================================================================= */
              <div className="bg-white text-gray-900 shadow-md border border-gray-300 w-full max-w-[780px] p-6 sm:p-8 rounded-xl space-y-4 text-[12px] leading-relaxed">
                {/* Header: Company & Tax Details */}
                <div className="border-b-2 border-gray-800 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-display font-black text-2xl tracking-wider text-brand-darkPurple">
                        {shopBrandTitle || 'ZEBA'}
                      </span>
                      <span className="text-[11px] uppercase tracking-widest text-brand-brightPink font-bold">
                        Period Care
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 text-xs">{settings?.legalEntityName || businessConfig.legalEntityName || 'ZEBA Wellness Technologies Private Limited'}</p>
                    <p className="text-gray-600 text-[11px] max-w-sm">
                      {[fromAddress, fromCityZip].filter(Boolean).join(', ').replace(/,\s*,/g, ', ')}
                    </p>
                    <div className="pt-0.5 text-[11px] text-gray-600 flex flex-wrap gap-x-3">
                      {realPan && <span><strong>PAN:</strong> {realPan}</span>}
                      {realGstin && <span><strong>GSTIN:</strong> {realGstin}</span>}
                      <span><strong>HSN:</strong> 30059090</span>
                      <span><strong>State:</strong> 32 - Kerala</span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Helpline: {fromPhone} | {settings?.websiteUrl || businessConfig.websiteUrl}
                    </p>
                  </div>

                  <div className="text-right space-y-1 sm:min-w-[220px]">
                    <div className="inline-block bg-gray-900 text-white font-black text-xs uppercase px-3 py-1 rounded tracking-wider">
                      Tax Invoice & Packing Slip
                    </div>
                    <p className="text-xs pt-1">
                      <span className="text-gray-500">Invoice No: </span>
                      <strong className="font-mono text-gray-900">{invoiceNumber}</strong>
                    </p>
                    <p className="text-xs">
                      <span className="text-gray-500">Order No: </span>
                      <strong className="font-mono text-gray-900">{orderNumber}</strong>
                    </p>
                    <p className="text-xs">
                      <span className="text-gray-500">Invoice Date: </span>
                      <strong className="text-gray-900">{orderDateFormatted}</strong>
                    </p>
                    {order.tracking_number ? (
                      <p className="text-xs">
                        <span className="text-gray-500">AWB / Tracking: </span>
                        <strong className="font-mono text-brand-plum">{order.tracking_number}</strong>
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Customer Bill To & Ship To Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-b border-gray-200 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Billed & Shipped To:</span>
                    <p className="font-bold text-gray-900 text-sm">{toName}</p>
                    <p className="text-gray-700 leading-snug">{toAddress}</p>
                    <p className="text-gray-700 font-medium">{toCityZip}</p>
                    {toPhone && (
                      <p className="text-gray-600 font-mono text-[11px] pt-0.5">Ph: {toPhone}</p>
                    )}
                  </div>
                  <div className="space-y-1 sm:text-right text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Payment & Supply Details:</span>
                    <p>
                      <span className="text-gray-500">Payment Status: </span>
                      <strong className={isPrepaid ? 'text-emerald-700 uppercase font-black' : 'text-amber-700 uppercase font-black'}>
                        {order.payment_status ? order.payment_status.toUpperCase() : (isPrepaid ? 'PAID' : 'PENDING')}
                      </strong>
                    </p>
                    <p>
                      <span className="text-gray-500">Payment Mode: </span>
                      <strong className="text-gray-800">{order.payment_method || (isPrepaid ? 'Online / UPI' : 'COD')}</strong>
                    </p>
                    <p>
                      <span className="text-gray-500">Place of Supply: </span>
                      <strong className="text-gray-800">{order.state || 'Kerala'} (State: 32)</strong>
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="tax-invoice-table w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 text-[10px]">
                        <th className="p-2 w-8 text-center">#</th>
                        <th className="p-2">Description of Goods</th>
                        <th className="p-2 w-20 text-center">HSN/SAC</th>
                        <th className="p-2 w-12 text-center">Qty</th>
                        <th className="p-2 w-20 text-right">Unit Rate (₹)</th>
                        <th className="p-2 w-20 text-right">Taxable (₹)</th>
                        <th className="p-2 w-24 text-right">GST ({gstRate}%)</th>
                        <th className="p-2 w-24 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-[11px]">
                      {order.items?.map((item, idx) => {
                        const qty = item.quantity || 1;
                        const lineTotal = parseFloat(item.subtotal_price || (qty * item.unit_price) || 0);
                        const lineTaxable = lineTotal / (1 + gstRate / 100);
                        const lineGst = lineTotal - lineTaxable;

                        // Discover genuine product barcode for this specific item
                        const itemBarcode = item.barcode || catalogProducts.find(p =>
                          p.id === item.product_id ||
                          (p.name && item.product_name && p.name.trim().toLowerCase() === item.product_name.trim().toLowerCase()) ||
                          (p.pack_size && item.pack_size && p.pack_size.trim().toLowerCase() === item.pack_size.trim().toLowerCase())
                        )?.barcode;

                        return (
                          <tr key={item.id || idx}>
                            <td className="p-2.5 text-center text-gray-500 font-medium">{idx + 1}</td>
                            <td className="p-2.5">
                              <strong className="text-gray-900 block">{item.product_name}</strong>
                              <div className="text-[10px] text-gray-500 flex items-center space-x-2 mt-0.5">
                                {item.pack_size && <span>Pack: {item.pack_size}</span>}
                                {itemBarcode && (
                                  <span className="font-mono text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded border border-gray-200">
                                    Barcode: {itemBarcode}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-mono text-[10px] text-gray-600">30059090</td>
                            <td className="p-2.5 text-center font-bold text-gray-900">{qty}</td>
                            <td className="p-2.5 text-right font-mono">₹{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                            <td className="p-2.5 text-right font-mono">₹{lineTaxable.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-mono">₹{lineGst.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-bold text-gray-900 font-mono">₹{lineTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pt-1">
                  <div className="sm:col-span-7 space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Amount in Words:</span>
                    <p className="font-bold text-gray-900 text-xs italic">{numberToWordsINR(totalAmount)}</p>
                    <p className="text-[10px] text-gray-600 pt-2">Computer-generated invoice. No physical signature required.</p>
                  </div>

                  <div className="sm:col-span-5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Taxable Value:</span>
                      <span className="font-mono">₹{taxableValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Total GST ({gstRate}%):</span>
                      <span className="font-mono">₹{totalGst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping Fee:</span>
                      <span className="font-mono">{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t-2 border-gray-800 flex justify-between font-bold text-gray-900 text-sm">
                      <span>Grand Total:</span>
                      <span className="font-black font-mono text-base">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="p-3.5 bg-white border-t border-brand-primaryPink/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-brand-plum flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>1 Sheet Guaranteed:</strong> Sized perfectly for {paperSize === 'a4' ? 'standard HP/Canon A4 printers' : '4" × 6" thermal sticker rolls'}.
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-brand-primaryPink/30 hover:bg-brand-softPink text-brand-dark font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-brand-brightPink/25 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {activeTab === 'courier_label' ? 'Courier Label' : 'Tax Invoice'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
