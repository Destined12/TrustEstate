import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  User,
  Home,
  ShieldCheck,
  AlertTriangle,
  FilePlus,
  Flag,
  MessageSquare,
  Gauge,
  ChevronRight,
  LogOut,
  Send,
} from "lucide-react";
import { UserProfile, Property, PropertyStatus, InterestedTenant } from "../../types";
import PropertyForm from "../Property/PropertyForm";
import PropertyGrid from "../Property/PropertyGrid";
import Onboarding from "../Auth/Onboarding";
import * as db from "../../dbService";

interface LandlordDashboardProps {
  user: UserProfile;
  properties: Property[];
  onAddProperty: (prop: Property) => void;
  onUpdateProperty: (id: string, updates: Partial<Property>) => void;
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  onVerify: (id: string) => void;
}

export default function LandlordDashboard({
  user,
  properties,
  onAddProperty,
  onUpdateProperty,
  onUpdateUser,
  onLogout,
  onVerify,
}: LandlordDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "verification" | "add" | "my-props" | "flagged" | "complaints"
  >("overview");
  const [complaintMsg, setComplaintMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectingTenantForId, setSelectingTenantForId] = useState<string | null>(null);

  const myProperties = useMemo(
    () => properties.filter((p) => p.ownerId === user.id),
    [properties, user.id]
  );

  const flaggedProperties = useMemo(
    () =>
      myProperties.filter(
        (p) => p.status === PropertyStatus.LOCKED || (p.fraudScore ?? 0) > 20
      ),
    [myProperties]
  );

  const stats = [
    { label: "Listed Properties", value: myProperties.length, icon: Home },
    {
      label: "Pending Verification",
      value: myProperties.filter(
        (p) => p.status === PropertyStatus.PENDING_CONFIRMATION
      ).length,
      icon: AlertTriangle,
    },
    {
      label: "Confirmed Deals",
      value: myProperties.filter(
        (p) => p.status === PropertyStatus.RENTED || p.status === PropertyStatus.SOLD
      ).length,
      icon: ShieldCheck,
    },
    { label: "Risk Signals", value: flaggedProperties.length, icon: Flag },
  ];

  const handlePropertySubmit = (prop: Property) => {
    onAddProperty(prop);
    setActiveTab("my-props");
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    onUpdateUser(updatedUser.id, updatedUser);
    setActiveTab("overview");
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMsg) return;
    setIsSubmitting(true);
    try {
      await db.createComplaint(user.id, complaintMsg);
      setComplaintMsg("");
      alert("Complaint submitted successfully.");
    } catch {
      alert("Failed to submit complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-12 bg-slate-50">
      {/* SIDEBAR */}
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-white border-r p-6">
        <nav className="flex flex-col gap-2">
          <NavBtn
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<Gauge size={16} />}
            label="Overview"
          />
          <NavBtn
            active={activeTab === "verification"}
            onClick={() => setActiveTab("verification")}
            icon={<User size={16} />}
            label="Verification"
          />
          <NavBtn
            active={activeTab === "add"}
            onClick={() => setActiveTab("add")}
            icon={<FilePlus size={16} />}
            label="Add Property"
          />
          <NavBtn
            active={activeTab === "my-props"}
            onClick={() => setActiveTab("my-props")}
            icon={<Home size={16} />}
            label="My Properties"
          />
          <NavBtn
            active={activeTab === "flagged"}
            onClick={() => setActiveTab("flagged")}
            icon={<Flag size={16} />}
            label="Flagged"
          />
          <NavBtn
            active={activeTab === "complaints"}
            onClick={() => setActiveTab("complaints")}
            icon={<MessageSquare size={16} />}
            label="Complaints"
          />
        </nav>

        <Button
          onClick={onLogout}
          variant="ghost"
          className="mt-10 text-rose-600 flex gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </aside>

      {/* MAIN */}
      <main className="col-span-12 md:col-span-9 lg:col-span-10 p-10 space-y-10">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400">{s.label}</p>
                    <p className="text-3xl font-black">{s.value}</p>
                  </div>
                  <s.icon size={28} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "verification" &&
          (user.isKycVerified ? (
            <Card>
              <CardContent className="p-10 text-center">
                <ShieldCheck size={48} className="mx-auto text-emerald-500" />
                <h2 className="mt-4 font-black text-2xl">Verified</h2>
              </CardContent>
            </Card>
          ) : (
            <Onboarding user={user} onComplete={handleOnboardingComplete} />
          ))}

        {activeTab === "add" && (
          <PropertyForm
            user={user}
            onSubmit={handlePropertySubmit}
            onClose={() => setActiveTab("overview")}
          />
        )}

        {activeTab === "my-props" && (
          <PropertyGrid
            properties={myProperties}
            user={user}
            onStatusChange={(id, status) =>
              onUpdateProperty(id, { status: status as PropertyStatus })
            }
            onVerify={onVerify}
            onViewDetails={() => {}}
            onFlag={(id) =>
              onUpdateProperty(id, { status: PropertyStatus.LOCKED })
            }
            onExpressInterest={() => {}}
            comparisonIds={[]}
            onToggleComparison={() => {}}
          />
        )}

        {activeTab === "flagged" && (
          <PropertyGrid
            properties={flaggedProperties}
            user={user}
            onStatusChange={(id, status) =>
              onUpdateProperty(id, { status: status as PropertyStatus })
            }
            onVerify={onVerify}
            onViewDetails={() => {}}
            onFlag={() => {}}
            onExpressInterest={() => {}}
            comparisonIds={[]}
            onToggleComparison={() => {}}
          />
        )}

        {activeTab === "complaints" && (
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <textarea
                  required
                  className="w-full p-4 border rounded-xl"
                  value={complaintMsg}
                  onChange={(e) => setComplaintMsg(e.target.value)}
                />
                <Button type="submit" disabled={isSubmitting}>
                  <Send size={14} className="mr-2" />
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
        active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      <span className="text-xs font-bold uppercase">{label}</span>
    </button>
  );
}
