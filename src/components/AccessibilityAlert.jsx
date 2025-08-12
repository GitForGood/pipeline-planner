import { CheckCircle } from "lucide-react";

const AccessibilityAlert = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-4" role="status" aria-live="polite" aria-atomic="true">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm"
        >
          <CheckCircle size={16} className="text-green-600" />
          {alert}
        </div>
      ))}
    </div>
  );
};

export default AccessibilityAlert;