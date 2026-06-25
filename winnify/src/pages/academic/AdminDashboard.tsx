import { useState } from 'react';
import { Users, BookOpen, GraduationCap, Building2, Calendar, Settings, BarChart3, FileText } from 'lucide-react';
import { mockDepartments, mockCourses, mockFaculty, mockStudents } from '../../data/mockAcademicData';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'analytics'>('overview');

  const stats = [
    {
      label: 'Total Departments',
      value: mockDepartments.length,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Faculty',
      value: mockFaculty.length,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Total Students',
      value: mockStudents.length,
      icon: GraduationCap,
      color: 'bg-purple-500',
    },
    {
      label: 'Active Courses',
      value: mockCourses.filter(c => c.status === 'Active').length,
      icon: BookOpen,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Institution-wide management and oversight</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'departments', label: 'Departments', icon: Building2 },
                { id: 'analytics', label: 'Analytics', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">System Status</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Operational
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-2">99.9%</p>
                      <p className="text-xs text-green-600 mt-1">Uptime</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Active Users</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          Live
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-2">1,247</p>
                      <p className="text-xs text-blue-600 mt-1">Currently online</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-800">Data Integrity</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                          Excellent
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 mt-2">100%</p>
                      <p className="text-xs text-purple-600 mt-1">No issues detected</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-3">
                    {[
                      { action: 'New HOD assigned', dept: 'Computer Science', time: '2 hours ago' },
                      { action: 'Academic Year 2024-2025 activated', dept: 'System', time: '1 day ago' },
                      { action: 'Bulk faculty import completed', dept: 'Electronics', time: '2 days ago' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.dept}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add Department
                  </button>
                </div>
                <div className="space-y-4">
                  {mockDepartments.map((dept) => (
                    <div key={dept.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{dept.name}</h4>
                          <p className="text-sm text-gray-500">Code: {dept.code}</p>
                          <p className="text-sm text-gray-600 mt-1">HOD: {dept.hodName}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                            View Details
                          </button>
                          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Institution Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Course Completion Rate</h4>
                      <div className="space-y-2">
                        {mockDepartments.map((dept) => (
                          <div key={dept.id}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">{dept.code}</span>
                              <span className="font-semibold text-gray-900">
                                {Math.floor(Math.random() * 20 + 70)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.floor(Math.random() * 20 + 70)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Student Success Rate</h4>
                      <div className="space-y-2">
                        {mockDepartments.map((dept) => (
                          <div key={dept.id}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">{dept.code}</span>
                              <span className="font-semibold text-gray-900">
                                {Math.floor(Math.random() * 15 + 80)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${Math.floor(Math.random() * 15 + 80)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Manage Users', icon: Users },
              { label: 'Academic Setup', icon: Calendar },
              { label: 'View Reports', icon: FileText },
              { label: 'System Settings', icon: Settings },
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <action.icon className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
