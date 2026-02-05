
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserRole, Property, PropertyStatus, LifecycleEntry } from './types';
import Layout from './components/Layout';
import PropertyGrid from './components/Property/PropertyGrid';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import LandlordDashboard from './components/Dashboard/LandlordDashboard';
import TenantDashboard from './components/Dashboard/TenantDashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import ProfilePage from './components/Profile/ProfilePage';
import * as db from './dbService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'All' | 'Sale' | 'Rent'>('All');

  const refreshData = async () => {
    const propsList = await db.fetchProperties();
    const usersList = await db.fetchUsers();
    setProperties(propsList);
    setUsers(usersList);
    if (currentUser) {
      const updatedMe = usersList.find(u => u.id === currentUser.id);
      if (updatedMe) setCurrentUser(updatedMe);
    }
  };

  useEffect(() => {
    const init = async () => {
      await db.initDb();
      await refreshData();
    };
    init();
  }, []);

  const handleAuth = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === UserRole.ADMIN) setActiveTab('dashboard');
    else if (user.role === UserRole.LANDLORD) setActiveTab('landlord-dash');
    else setActiveTab('tenant-dash');
    refreshData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    const prop = properties.find(p => p.id === id);
    if (prop) {
      // If status is changing, we should handle the lifecycle log entry
      let newLifecycle: LifecycleEntry[] = prop.lifecycleLog || [];
      if (updates.status && updates.status !== prop.status) {
        let note = 'Protocol State Transition';
        if (updates.status === PropertyStatus.LOCKED) note = 'Fraud or Dispute Security Lock';
        if (updates.status === PropertyStatus.PENDING_CONFIRMATION) note = 'Deal initiated by Owner';
        if (updates.status === PropertyStatus.SOLD || updates.status === PropertyStatus.RENTED) note = 'Deal finalized and verified by Tenant';

        newLifecycle = [
          ...newLifecycle,
          {
            status: updates.status,
            timestamp: new Date().toISOString(),
            actor: currentUser?.name || 'System Registry',
            note
          }
        ];
      }

      const updated = { 
        ...prop, 
        ...updates,
        lifecycleLog: newLifecycle 
      };
      await db.saveProperty(updated);
      await refreshData();
    }
  };

  const handleVerifyDeal = async (id: string) => {
    const prop = properties.find(p => p.id === id);
    if (prop) {
      const finalStatus = prop.type === 'Sale' ? PropertyStatus.SOLD : PropertyStatus.RENTED;
      await handleUpdateProperty(id, { status: finalStatus });
      await db.logAudit("VERIFY_DEAL", id, { finalStatus });
    }
  };

  const handleAddProperty = async (prop: Property) => {
    // Add initial lifecycle log
    const initialLog: LifecycleEntry = {
      status: PropertyStatus.AVAILABLE,
      timestamp: new Date().toISOString(),
      actor: currentUser?.name || 'Owner',
      note: 'Initial Registry Enrollment'
    };
    const newProp = { ...prop, lifecycleLog: [initialLog] };
    await db.saveProperty(newProp);
    await refreshData();
  };

  const handleUpdateUser = async (id: string, updates: Partial<UserProfile>) => {
    const userToUpdate = users.find(u => u.id === id);
    if (userToUpdate) {
      const updated = { ...userToUpdate, ...updates };
      await db.upsertUser(updated);
      await refreshData();
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => filterType === 'All' || p.type === filterType);
  }, [properties, filterType]);

  const renderContent = () => {
    if (activeTab === 'login') return <Login onLogin={handleAuth} onSwitchToRegister={() => setActiveTab('register')} />;
    if (activeTab === 'register') return <Register onRegister={handleAuth} onSwitchToLogin={() => setActiveTab('login')} />;

    switch (activeTab) {
      case 'home': return <Home onGetStarted={() => setActiveTab('listings')} />;
      case 'about': return <About />;
      case 'contact': return <Contact />;
      case 'listings':
        return (
          <div className="p-12 space-y-12">
            <div className="flex justify-between items-end border-b pb-8 border-slate-100">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Marketplace</h2>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Active Registry Nodes</p>
              </div>
              <div className="flex gap-4">
                <select 
                  className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                >
                  <option value="All">All Assets</option>
                  <option value="Sale">Sale Only</option>
                  <option value="Rent">Rent Only</option>
                </select>
                {!currentUser && (
                  <button 
                    onClick={() => setActiveTab('login')} 
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100"
                  >
                    Authorize to view private deals
                  </button>
                )}
              </div>
            </div>
            <PropertyGrid 
              properties={filteredProperties} 
              user={currentUser || { id: 'guest', name: 'Guest', email: '', role: UserRole.TENANT, isKycVerified: false, kycStep: 0 }} 
              onStatusChange={(id, status) => handleUpdateProperty(id, { status: status as PropertyStatus })} 
              onVerify={handleVerifyDeal} 
              onViewDetails={() => {}} 
              onFlag={(id) => handleUpdateProperty(id, { status: PropertyStatus.LOCKED })} 
              onExpressInterest={(id) => {
                const p = properties.find(x => x.id === id);
                if (p && currentUser) {
                  const alreadyIn = p.interestedTenants?.some(t => t.id === currentUser.id);
                  if (!alreadyIn) {
                    const interest = [...(p.interestedTenants || []), { id: currentUser.id, name: currentUser.name, email: currentUser.email, timestamp: new Date().toISOString() }];
                    handleUpdateProperty(id, { interestedTenants: interest });
                  }
                }
              }} 
              comparisonIds={comparisonIds} 
              onToggleComparison={(id) => setComparisonIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])} 
            />
          </div>
        );
      
      case 'profile':
        return currentUser ? (
          <ProfilePage 
            user={currentUser} 
            properties={properties} 
            onUpdateUser={handleUpdateUser} 
            onLogout={handleLogout} 
          />
        ) : <Login onLogin={handleAuth} onSwitchToRegister={() => setActiveTab('register')} />;

      case 'landlord-dash': 
        return currentUser?.role === UserRole.LANDLORD ? (
          <LandlordDashboard 
            user={currentUser} 
            properties={properties} 
            onAddProperty={handleAddProperty}
            onUpdateProperty={handleUpdateProperty}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onVerify={handleVerifyDeal}
          />
        ) : <Login onLogin={handleAuth} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'tenant-dash': 
        return currentUser?.role === UserRole.TENANT ? (
          <TenantDashboard 
            user={currentUser} 
            properties={properties} 
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onVerify={handleVerifyDeal}
          />
        ) : <Login onLogin={handleAuth} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'dashboard':
        return currentUser?.role === UserRole.ADMIN ? (
          <AdminDashboard 
            users={users} 
            properties={properties} 
            onUpdateUser={handleUpdateUser}
            onUpdateProperty={handleUpdateProperty}
            onLogout={handleLogout}
          />
        ) : <Login onLogin={handleAuth} onSwitchToRegister={() => setActiveTab('register')} />;
      
      default: return <Home onGetStarted={() => setActiveTab('listings')} />;
    }
  };

  return (
    <div className="h-full w-full">
      <Layout 
        user={currentUser || { id: 'guest', name: 'Guest', email: '', role: UserRole.TENANT, isKycVerified: false, kycStep: 0 }} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {renderContent()}
      </Layout>
    </div>
  );
};

export default App;
