'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const QUERY_OPTIONS = [
  { value: '', label: { en: '— Select your query —', ar: '— اختر نوع استفسارك —' } },
  { value: 'general', label: { en: 'General Enquiry', ar: 'استفسار عام' } },
  { value: 'housing', label: { en: 'Housing & Accommodation', ar: 'السكن والإقامة' } },
  { value: 'booking', label: { en: 'Booking Issue', ar: 'مشكلة في الحجز' } },
  { value: 'payment', label: { en: 'Payment & Billing', ar: 'الدفع والفواتير' } },
  { value: 'technical', label: { en: 'Technical Support', ar: 'الدعم الفني' } },
  { value: 'other', label: { en: 'Other', ar: 'أخرى' } },
];

export default function SubmitRequestPage() {
  const { language } = useLanguage();
  const lang = language;
  const isAr = lang === 'ar';

  const [form, setForm] = useState({
    email: '',
    query: '',
    subject: '',
    description: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Helpers ──
  const t = (en, ar) => (isAr ? ar : en);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = t('Email is required', 'البريد الإلكتروني مطلوب');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = t('Invalid email address', 'بريد إلكتروني غير صحيح');
    if (!form.query) errs.query = t('Please select a query type', 'يرجى اختيار نوع الاستفسار');
    if (!form.subject.trim()) errs.subject = t('Subject is required', 'الموضوع مطلوب');
    if (!form.description.trim()) errs.description = t('Description is required', 'الوصف مطلوب');
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/data?collection=request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          query: form.query,
          subject: form.subject,
          description: form.description,
          attachmentNames: attachments.map((f) => f.name),
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Server error');
      setSuccess(true);
    } catch (err) {
      setError(t('Something went wrong. Please try again.', 'حدث خطأ ما. يرجى المحاولة مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ──
  if (success) {
    return (
      <div className={`min-h-screen bg-white font-sans flex items-center justify-center px-4 ${isAr ? 'rtl' : 'ltr'}`}>
        <div className="text-center max-w-sm">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: '#fef2f2' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="#e8445a" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-black mb-2">
            {t('Request Submitted!', 'تم إرسال طلبك!')}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t(
              'A member of our support staff will respond as soon as possible.',
              'سيقوم أحد أعضاء فريق الدعم بالرد في أقرب وقت ممكن.'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white font-sans ${isAr ? 'rtl' : 'ltr'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 mb-4"
            style={{ color: '#e8445a', backgroundColor: '#fef2f2' }}
          >
            {t('Support', 'الدعم')}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-black mb-2">
            {t('Submit a Request', 'إرسال طلب')}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {t(
              'Please enter the details of your request. A member of our support staff will respond as soon as possible.',
              'يرجى إدخال تفاصيل طلبك. سيقوم أحد أعضاء فريق الدعم بالرد في أقرب وقت ممكن.'
            )}
          </p>
        </div>

        <div className="border-t border-gray-100 mb-8" />

        {/* Form */}
        <div className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">
              {t('Your email address', 'بريدك الإلكتروني')}
              <span style={{ color: '#e8445a' }}> *</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t('you@example.com', 'you@example.com')}
              className="w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-all"
              style={{
                borderColor: fieldErrors.email ? '#e8445a' : '#e5e7eb',
                boxShadow: fieldErrors.email ? '0 0 0 3px #fef2f2' : 'none',
              }}
              onFocus={(e) => { if (!fieldErrors.email) e.target.style.borderColor = '#e8445a'; }}
              onBlur={(e) => { if (!fieldErrors.email) e.target.style.borderColor = '#e5e7eb'; }}
            />
            {fieldErrors.email && (
              <p className="text-xs mt-1 font-medium" style={{ color: '#e8445a' }}>{fieldErrors.email}</p>
            )}
          </div>

          {/* Query Select */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">
              {t('Select your query', 'نوع الاستفسار')}
              <span style={{ color: '#e8445a' }}> *</span>
            </label>
            <div className="relative">
              <select
                name="query"
                value={form.query}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border rounded-lg outline-none appearance-none bg-white transition-all"
                style={{
                  borderColor: fieldErrors.query ? '#e8445a' : '#e5e7eb',
                  boxShadow: fieldErrors.query ? '0 0 0 3px #fef2f2' : 'none',
                  color: form.query ? '#111' : '#9ca3af',
                }}
                onFocus={(e) => { if (!fieldErrors.query) e.target.style.borderColor = '#e8445a'; }}
                onBlur={(e) => { if (!fieldErrors.query) e.target.style.borderColor = '#e5e7eb'; }}
              >
                {QUERY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                    {isAr ? opt.label.ar : opt.label.en}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {fieldErrors.query && (
              <p className="text-xs mt-1 font-medium" style={{ color: '#e8445a' }}>{fieldErrors.query}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">
              {t('Subject', 'الموضوع')}
              <span style={{ color: '#e8445a' }}> *</span>
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder={t('Brief summary of your request', 'ملخص قصير لطلبك')}
              className="w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-all"
              style={{
                borderColor: fieldErrors.subject ? '#e8445a' : '#e5e7eb',
                boxShadow: fieldErrors.subject ? '0 0 0 3px #fef2f2' : 'none',
              }}
              onFocus={(e) => { if (!fieldErrors.subject) e.target.style.borderColor = '#e8445a'; }}
              onBlur={(e) => { if (!fieldErrors.subject) e.target.style.borderColor = '#e5e7eb'; }}
            />
            {fieldErrors.subject && (
              <p className="text-xs mt-1 font-medium" style={{ color: '#e8445a' }}>{fieldErrors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">
              {t('Description', 'الوصف')}
              <span style={{ color: '#e8445a' }}> *</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder={t(
                'Please enter the details of your request. A member of our support staff will respond as soon as possible.',
                'يرجى إدخال تفاصيل طلبك. سيقوم أحد أعضاء فريق الدعم بالرد في أقرب وقت ممكن.'
              )}
              className="w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-all resize-none"
              style={{
                borderColor: fieldErrors.description ? '#e8445a' : '#e5e7eb',
                boxShadow: fieldErrors.description ? '0 0 0 3px #fef2f2' : 'none',
              }}
              onFocus={(e) => { if (!fieldErrors.description) e.target.style.borderColor = '#e8445a'; }}
              onBlur={(e) => { if (!fieldErrors.description) e.target.style.borderColor = '#e5e7eb'; }}
            />
            {fieldErrors.description && (
              <p className="text-xs mt-1 font-medium" style={{ color: '#e8445a' }}>{fieldErrors.description}</p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-bold text-black mb-1.5">
              {t('Attachments', 'المرفقات')}
              <span className="text-gray-400 font-normal ml-1">({t('optional', 'اختياري')})</span>
            </label>

            {/* Drop zone */}
            <label
              className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg py-6 px-4 cursor-pointer transition-all"
              style={{ borderColor: '#e5e7eb' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e8445a'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
              <span className="text-xs text-gray-500 font-medium">
                {t('Click to upload or drag files here', 'انقر للرفع أو اسحب الملفات هنا')}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                {t('PNG, JPG, PDF up to 10MB', 'PNG, JPG, PDF حتى 10MB')}
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                onChange={handleFiles}
              />
            </label>

            {/* File list */}
            {attachments.length > 0 && (
              <ul className="mt-3 space-y-2">
                {attachments.map((file, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-xs text-gray-600 truncate">{file.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Global error */}
          {error && (
            <p className="text-xs font-medium text-center py-2 px-4 rounded-lg bg-red-50" style={{ color: '#e8445a' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 text-sm font-black text-white transition-all disabled:opacity-60"
            style={{ backgroundColor: '#e8445a' }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {submitting
              ? t('Submitting...', 'جاري الإرسال...')
              : t('Submit Request', 'إرسال الطلب')}
          </button>

        </div>
      </div>
    </div>
  );
}