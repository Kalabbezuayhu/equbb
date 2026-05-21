import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { useAppStore, useToast } from '../store';
import { Search, Plus, Edit, Trash2, Phone, Mail, Calendar, CheckCircle2, Clock, X } from 'lucide-react';
import { cn } from '../lib/utils';

const MembersPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });
  const [localLoading, setLocalLoading] = useState(true);
  const { members, fetchAllData, addMember } = useAppStore();
  const { addToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAllData();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLocalLoading(false);
      }
    };
    loadData();
  }, [fetchAllData]);

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  const statusIcons = {
    active: CheckCircle2,
    pending: Clock,
    inactive: X,
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMember(newMember);
      addToast('Member added successfully!', 'success');
      setShowAddModal(false);
      setNewMember({ name: '', email: '', phone: '' });
    } catch (error) {
      addToast('Failed to add member!', 'error');
    }
  };

  if (localLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Members Page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Members</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage all Equb members</p>
              </div>
              <Button onClick={() => setShowAddModal(true)} className="gap-2">
                <Plus className="w-5 h-5" /> Add Member
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    placeholder="Search members..." 
                    className="pl-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMembers.map((member, index) => {
                    const StatusIcon = statusIcons[member.status as keyof typeof statusIcons];
                    return (
                      <motion.div 
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        <Card className="p-6 hover:shadow-xl transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", statusColors[member.status as keyof typeof statusColors])}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{member.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{member.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">Joined {member.joinedAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Payments Made</p>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">{member.paymentsPaid}/5</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
                              <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </main>

        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Member</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddMember} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <Input 
                      placeholder="Enter full name" 
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <Input 
                      type="email" 
                      placeholder="Enter email" 
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                    <Input 
                      placeholder="Enter phone number" 
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      required
                    />
                  </div>
                </form>
                <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleAddMember}>Add Member</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MembersPage;
