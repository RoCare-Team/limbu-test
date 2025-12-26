"use client";

import { CheckCircle, XCircle, MapPin, Calendar, Download, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function GBPAuditCard({ audit }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Handle potential nested structure from input (audit[""] or direct audit)
  const auditData = audit[""] || audit;
  const guidanceText = audit.output?.[0]?.content?.[0]?.text || "";

  const {
    totalScore,
    status,
    dataSnapshot,
    scoreBreakdown,
    recommendationSignals,
  } = auditData;

  // Animate score on mount
  useEffect(() => {
    let start = 0;
    const end = totalScore;
    const duration = 2000; // 2 seconds
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [totalScore]);

  const getStatusColor = (score) => {
    if (score >= 80) return { bg: "#dcfce7", text: "#16a34a", label: "Good Performance" };
    if (score >= 60) return { bg: "#ffedd5", text: "#ea580c", label: "Average Performance" };
    return { bg: "#fee2e2", text: "#dc2626", label: "Poor Performance" };
  };

  const statusInfo = getStatusColor(totalScore);

  const date = new Date().toLocaleString();

  const handleDownloadPDF = async () => {
    const element = document.getElementById("audit-card-content");
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`GBP-Audit-${dataSnapshot.businessName.replace(/\s+/g, "-")}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div 
        id="audit-card-content" 
        className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
        style={{ backgroundColor: "#ffffff", color: "#1f2937" }}
      >
      {/* Header */}
      <div className="text-white p-6" style={{ background: "linear-gradient(to right, #1d4ed8, #3b82f6)" }}>
        <h2 className="text-2xl font-bold mb-2">Google Business Profile Audit Score</h2>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{dataSnapshot.businessName}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-800/30 px-3 py-1 rounded-full">
            <span>{date}</span>
          </div>
        </div>
        {/* <div className="text-center mt-2 text-sm opacity-90">Local SEO Performance</div> */}
      </div>

      {/* Speedometer Gauge */}
      <div className="flex flex-col items-center py-10" style={{ background: "linear-gradient(to bottom, #f9fafb, #ffffff)" }}>
        <div className="relative w-80 h-48">
          <Speedometer score={animatedScore} />
        </div>
        
        <div className="text-center mt-6">
          <div className="text-5xl font-bold" style={{ color: "#1f2937" }}>
            {animatedScore}
            <span className="text-2xl" style={{ color: "#9ca3af" }}>/100</span>
          </div>
          <span className="mt-3 inline-block px-6 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}>
            {statusInfo.label}
          </span>
        </div>
        
        <p className="mt-4 text-sm max-w-md text-center" style={{ color: "#4b5563" }}>
          Your profile needs improvement to rank better on Google Maps.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 pb-8">
        <StatCard icon="⭐" title="Total Reviews" value={dataSnapshot.totalReviews} />
        <StatCard icon="📊" title="Avg. Rating" value={dataSnapshot.averageRating ?? "N/A"} />
        <StatCard icon="📝" title="Posts (30 Days)" value={dataSnapshot.totalPosts} />
        <StatCard icon="🖼️" title="Photos & Media" value={dataSnapshot.totalMedia} />
      </div>

      {/* Score Breakdown */}
      <div className="px-6 pb-6">
        <h3 className="text-xl font-bold mb-6 text-center">Score Breakdown</h3>
        <div className="space-y-4">
          {scoreBreakdown.map((item) => {
            const percent = (item.score / item.outOf) * 100;
            const icon = percent === 100 ? "✓" : percent >= 50 ? "⚠" : "⚠";
            
            let iconBg, iconColor, barColor;
            if (percent === 100) { iconBg = "#dcfce7"; iconColor = "#16a34a"; barColor = "#22c55e"; }
            else if (percent >= 50) { iconBg = "#ffedd5"; iconColor = "#ea580c"; barColor = "#fb923c"; }
            else { iconBg = "#fee2e2"; iconColor = "#dc2626"; barColor = "#ef4444"; }
            
            return (
              <div 
                key={item.factor} 
                className="rounded-xl p-4 border border-gray-200"
                style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: iconBg, color: iconColor }}>
                      {icon}
                    </span>
                    <span className="font-semibold" style={{ color: "#1f2937" }}>{item.factor}</span>
                  </div>
                  <span className="font-bold" style={{ color: "#374151" }}>
                    {item.score}/{item.outOf}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
                    <div
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
                {/* Render Details if available */}
                {item.details && item.details.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.details.map((detail, idx) => (
                      <div 
                        key={idx} 
                        className="flex justify-between text-xs p-2 rounded border border-gray-100"
                        style={{ backgroundColor: "#ffffff", borderColor: "#f3f4f6", color: "#4b5563" }}
                      >
                        <span>{detail.item}</span>
                        <span className="font-medium">
                          {detail.score}/{detail.outOf}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Guidance Section */}
      {guidanceText && (
        <div className="px-6 pb-8">
          <div 
            className="rounded-xl p-6 border border-blue-100"
            style={{ backgroundColor: "#eff6ff", borderColor: "#dbeafe" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" style={{ color: "#2563eb" }} />
              <h3 className="text-lg font-bold" style={{ color: "#1e40af" }}>Audit Insights & Guidance</h3>
            </div>
            <div className="prose prose-sm max-w-none" style={{ color: "#374151" }}>
              {guidanceText.split('\n').map((line, i) => {
                // Simple Markdown-like rendering
                if (line.startsWith('###')) return <h4 key={i} className="text-md font-bold mt-4 mb-2" style={{ color: "#111827" }}>{line.replace(/#/g, '')}</h4>;
                if (line.startsWith('**') && line.endsWith('**')) return <h4 key={i} className="font-bold mt-4 mb-2" style={{ color: "#111827" }}>{line.replace(/\*/g, '')}</h4>;
                if (line.startsWith('•')) return <li key={i} className="ml-4 list-disc mb-1">{line.replace('•', '').trim()}</li>;
                if (line.includes('---')) return <hr key={i} className="my-4 border-blue-200" />;
                if (!line.trim()) return <br key={i} />;
                
                // Handle bold text inside paragraphs
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={i} className="mb-1">
                    {parts.map((part, j) => (
                      part.startsWith('**') ? <strong key={j}>{part.replace(/\*/g, '')}</strong> : part
                    ))}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="grid sm:grid-cols-2 gap-6 px-6 pb-8">
        <ActionBox
          title="Action Required"
          danger
          items={[
            recommendationSignals.noServices && "No services added",
            recommendationSignals.lowReviews && "Review count is too Low",
            recommendationSignals.lowReplyRate && "No review replies",
          ]}
        />

        <ActionBox
          title="What You're Doing Right"
          items={[
            !recommendationSignals.missingPhone && "Complete business details",
            !recommendationSignals.weakDescription && "Strong description",
            !recommendationSignals.inactivePosts && "Consistent posting",
            !recommendationSignals.lowMedia && "Good media presence",
          ]}
        />
      </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pb-8 px-6 mb-8">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
          Improve My Google Ranking
        </button>
        <button 
          onClick={handleDownloadPDF}
          className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </button>
      </div>
    </div>
  );
}

/* Speedometer Component */
function Speedometer({ score }) {
  const radius = 140;
  const strokeWidth = 24;
  const center = 160;
  
  // Helper to calculate coordinates
  const getCoords = (angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angleInRadians),
      y: center + radius * Math.sin(angleInRadians)
    };
  };

  // Angles (0 score = 180 deg, 100 score = 360 deg)
  // Red: 0-60 score -> 180 to 288 deg
  // Orange: 60-80 score -> 288 to 324 deg
  // Green: 80-100 score -> 324 to 360 deg

  const start = getCoords(180);
  const endRed = getCoords(288);
  const endOrange = getCoords(324);
  const endGreen = getCoords(360);

  // Needle
  const needleAngle = 180 + (score / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLength = radius - 20;
  const needleX = center + needleLength * Math.cos(needleRad);
  const needleY = center + needleLength * Math.sin(needleRad);

  // Labels
  const labels = [0, 25, 50, 75, 100];

  return (
    <svg width="320" height="200" viewBox="0 0 320 200" className="mx-auto">
      
      {/* Red section (0-60) */}
      <path
        d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${endRed.x} ${endRed.y}`}
        fill="none"
        stroke="#ef4444"
        strokeWidth={strokeWidth}
      />
      
      {/* Orange section (60-80) */}
      <path
        d={`M ${endRed.x} ${endRed.y} A ${radius} ${radius} 0 0 1 ${endOrange.x} ${endOrange.y}`}
        fill="none"
        stroke="#fb923c"
        strokeWidth={strokeWidth}
      />
      
      {/* Green section (80-100) */}
      <path
        d={`M ${endOrange.x} ${endOrange.y} A ${radius} ${radius} 0 0 1 ${endGreen.x} ${endGreen.y}`}
        fill="none"
        stroke="#22c55e"
        strokeWidth={strokeWidth}
      />

      {/* Labels */}
      {labels.map((val) => {
        const a = 180 + (val / 100) * 180;
        // Adjust text position slightly inward
        const textRad = (a * Math.PI) / 180;
        const textR = radius - 35; 
        const tx = center + textR * Math.cos(textRad);
        const ty = center + textR * Math.sin(textRad);
        return (
          <text
            key={val}
            x={tx}
            y={ty}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-bold"
            fill="#6b7280"
            style={{ fontSize: '12px' }}
          >
            {val}
          </text>
        );
      })}

      {/* Center circle (decorative, darker) */}
      <circle cx={center} cy={center} r="45" fill="#1f2937" />
      
      {/* Needle */}
      <line
        x1={center}
        y1={center}
        x2={needleX}
        y2={needleY}
        stroke="#1f2937"
        strokeWidth="4"
        strokeLinecap="round"
        className="transition-all duration-2000 ease-out"
      />
      
      {/* Center dot */}
      <circle cx={center} cy={center} r="6" fill="#ef4444" />
    </svg>
  );
}

/* Stat Card */
function StatCard({ icon, title, value }) {
  return (
    <div 
      className="p-5 rounded-xl border-2 border-gray-100 text-center hover:shadow-md transition-shadow"
      style={{ background: "linear-gradient(to bottom right, #f9fafb, #ffffff)", borderColor: "#f3f4f6" }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold" style={{ color: "#1f2937" }}>{value}</div>
      <div className="text-xs mt-1 font-medium" style={{ color: "#6b7280" }}>{title}</div>
    </div>
  );
}

/* Action Box */
function ActionBox({ title, items, danger }) {
  const bgStyle = danger 
    ? { background: "linear-gradient(to bottom right, #fef2f2, #fff7ed)", borderColor: "#fecaca" }
    : { background: "linear-gradient(to bottom right, #f0fdf4, #ecfdf5)", borderColor: "#bbf7d0" };
  
  const titleColor = danger ? "#b91c1c" : "#15803d";
    
  return (
    <div
      className="rounded-xl p-5 border-2"
      style={bgStyle}
    >
      <h4 className="font-bold mb-4 text-lg flex items-center gap-2" style={{ color: titleColor }}>
        {danger ? "❌" : "✓"} {title}
      </h4>
      <ul className="space-y-3 text-sm">
        {items.filter(Boolean).map((text, i) => (
          <li key={i} className="flex gap-3 items-start">
            {danger ? (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
            ) : (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
            )}
            <span className="font-medium" style={{ color: "#374151" }}>{text}</span>
          </li>
        ))}
      </ul>
      {danger && (
        <p className="text-xs mt-4 italic" style={{ color: "#4b5563" }}>
          Fixing these can significantly improve your local ranking.
        </p>
      )}
    </div>
  );
}