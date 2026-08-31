import React from "react";
import { Phone, Mail } from "lucide-react";

export interface ResumeTemplateProps {
  user: any;
  profile: any;
  seaExperience?: any[]; 
  certificates?: any[];  
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; 
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const hasValue = (val: any) => {
  if (val === undefined || val === null || val === false) return false;
  const str = String(val).trim().toLowerCase();
  return (
    str !== "" && 
    str !== "—" && 
    str !== "-" &&
    str !== "not specified" && 
    str !== "not provided" && 
    str !== "no" && 
    str !== "false"
  );
};

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({
  user,
  profile,
  seaExperience = [],
  certificates = [],
}) => {
  const name = user?.name || profile?.full_name || "YOUR NAME";
  const rank = profile?.applied_rank || user?.role || "NOT SPECIFIED";

  const activeCertificates = certificates.filter(c => hasValue(c.document_number));

  const isTravelDoc = (docName = "") => {
    const n = docName.toUpperCase();
    return n.includes("CDC") || n.includes("SID") || n.includes("YELLOW FEVER") || n.includes("PASSPORT") || n.includes("SEAMEN BOOK");
  };

  const stcwCerts = activeCertificates.filter(c => !isTravelDoc(c.custom_name || c.doc_type_name));
  const docCerts = activeCertificates.filter(c => isTravelDoc(c.custom_name || c.doc_type_name));

  return (
    <div 
      id="resume-print-area" 
      // 🚀 FIXED: Removed print:p-0, added print:p-12 print:w-full to guarantee PDF padding
      className="w-full max-w-[210mm] mx-auto bg-white p-10 text-slate-900 shadow-xl print:shadow-none print:p-12 print:w-full print:max-w-none font-sans antialiased box-border"
    >
      <div className="flex items-center gap-8 border-b-4 border-slate-900 pb-6 mb-6 cv-section">
        <div className="w-32 h-40 bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 overflow-hidden">
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-slate-400 tracking-widest">PHOTO</span>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900">
            {name}
          </h1>
          <h2 className="text-xl font-bold text-slate-600 uppercase tracking-widest mt-1">
            {rank}
          </h2>
          
          <div className="flex flex-wrap gap-6 mt-4 text-sm font-medium text-slate-700">
            {hasValue(user?.phone || profile?.phone) && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{user?.phone || profile?.phone}</span>
              </div>
            )}
            {hasValue(user?.email) && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasValue(profile?.summary) && (
        <div className="mb-6 cv-section">
          <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 text-slate-800">
            Professional Profile
          </h3>
          <p className="text-sm leading-relaxed text-slate-700">
            {profile.summary}
          </p>
        </div>
      )}

      <div className="mb-6 cv-section">
        <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 text-slate-800">
          Personal Credentials
        </h3>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          {hasValue(profile?.indos_number) && <div className="flex"><span className="w-32 font-bold text-slate-700">INDOS No:</span> <span>{profile.indos_number}</span></div>}
          {hasValue(profile?.nationality) && <div className="flex"><span className="w-32 font-bold text-slate-700">Nationality:</span> <span>{profile.nationality}</span></div>}
          {hasValue(profile?.date_of_birth) && <div className="flex"><span className="w-32 font-bold text-slate-700">Date of Birth:</span> <span>{formatDate(profile.date_of_birth)}</span></div>}
          {hasValue(profile?.gender) && <div className="flex"><span className="w-32 font-bold text-slate-700">Gender:</span> <span>{profile.gender}</span></div>}
          {hasValue(profile?.passport_number) && <div className="flex"><span className="w-32 font-bold text-slate-700">Passport No:</span> <span>{profile.passport_number}</span></div>}
          {hasValue(profile?.passport_expiry_date) && <div className="flex"><span className="w-32 font-bold text-slate-700">Passport Expiry:</span> <span>{formatDate(profile.passport_expiry_date)}</span></div>}
          {hasValue(profile?.has_us_visa) && <div className="flex"><span className="w-32 font-bold text-slate-700">US Visa (C1/D):</span> <span>Yes</span></div>}
          {hasValue(profile?.marital_status) && <div className="flex"><span className="w-32 font-bold text-slate-700">Marital Status:</span> <span>{profile.marital_status}</span></div>}
          {hasValue(profile?.nearest_airport) && <div className="flex"><span className="w-32 font-bold text-slate-700">Nearest Airport:</span> <span>{profile.nearest_airport}</span></div>}
        </div>

        {(hasValue(profile?.permanent_address) || hasValue(profile?.present_address)) && (
          <div className="grid grid-cols-2 gap-6 text-sm mt-4">
            {hasValue(profile?.permanent_address) && (
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-md">
                <span className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Permanent Address</span>
                <p className="whitespace-pre-wrap text-slate-600">{profile.permanent_address}</p>
              </div>
            )}
            {hasValue(profile?.present_address) && (
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-md">
                <span className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Present Address</span>
                <p className="whitespace-pre-wrap text-slate-600">{profile.present_address}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {stcwCerts.length > 0 && (
        <div className="mb-6 cv-section">
          <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 text-slate-800">
            STCW Certificates & Competency
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="p-2 border border-slate-300 font-bold uppercase">Document</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">Cert No.</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">Validity</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">Place of Issue</th>
              </tr>
            </thead>
            <tbody>
              {stcwCerts.map((cert, idx) => (
                <tr key={idx} className="border border-slate-300">
                  <td className="p-2 border border-slate-300 font-bold">{cert.custom_name || cert.doc_type_name || "—"}</td>
                  <td className="p-2 border border-slate-300">{cert.document_number || "—"}</td>
                  <td className="p-2 border border-slate-300 whitespace-nowrap">
                    {cert.lifetime ? "LIFETIME" : formatDate(cert.expiry_date)}
                  </td>
                  <td className="p-2 border border-slate-300">{cert.place_of_issue || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {docCerts.length > 0 && (
        <div className="mb-6 cv-section">
          <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 text-slate-800">
            Documents & Licensing
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="p-2 border border-slate-300 font-bold uppercase">Document</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">Doc No.</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">Validity</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">Place of Issue</th>
              </tr>
            </thead>
            <tbody>
              {docCerts.map((cert, idx) => (
                <tr key={idx} className="border border-slate-300">
                  <td className="p-2 border border-slate-300 font-bold">{cert.custom_name || cert.doc_type_name || "—"}</td>
                  <td className="p-2 border border-slate-300">{cert.document_number || "—"}</td>
                  <td className="p-2 border border-slate-300 whitespace-nowrap">
                    {cert.lifetime ? "LIFETIME" : formatDate(cert.expiry_date)}
                  </td>
                  <td className="p-2 border border-slate-300">{cert.place_of_issue || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mb-6 cv-section">
        <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-300 pb-1 mb-3 text-slate-800">
          Sea Experience
        </h3>
        {seaExperience.length > 0 ? (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="p-2 border border-slate-300 font-bold uppercase">Vessel</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">Company</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">Rank</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">From</th>
                <th className="p-2 border border-slate-300 font-bold uppercase">To</th>
              </tr>
            </thead>
            <tbody>
              {seaExperience.map((exp, idx) => (
                <tr key={idx} className="border border-slate-300">
                  <td className="p-2 border border-slate-300 font-bold">{exp.vessel_name || "—"}</td>
                  <td className="p-2 border border-slate-300">{exp.company || "—"}</td>
                  <td className="p-2 border border-slate-300">{exp.rank || "—"}</td>
                  <td className="p-2 border border-slate-300 whitespace-nowrap">{formatDate(exp.from_date || exp.sign_on || exp.fromDate)}</td>
                  <td className="p-2 border border-slate-300 whitespace-nowrap">{formatDate(exp.to_date || exp.sign_off || exp.toDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-slate-500 italic">No sea experience recorded.</p>
        )}
      </div>

    </div>
  );
}

export default ResumeTemplate;