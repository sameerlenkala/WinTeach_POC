import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, UserCircle, Shield, FileCheck } from 'lucide-react';

type UserRole = 'Admin' | 'HOD' | 'Faculty' | 'Student' | 'TA' | 'Reviewer';

export default function AcademicPortal() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: 'Admin' as UserRole,
      title: 'Admin',
      description: 'Institution-level management and oversight',
      icon: Shield,
      color: 'bg-red-500',
      route: '/academic/admin',
    },
    {
      id: 'HOD' as UserRole,
      title: 'HOD',
      description: 'Department management and course oversight',
      icon: Users,
      color: 'bg-blue-500',
      route: '/academic/hod',
    },
    {
      id: 'Faculty' as UserRole,
      title: 'Faculty',
      description: 'Course delivery and content management',
      icon: BookOpen,
      color: 'bg-green-500',
      route: '/academic/faculty',
    },
    {
      id: 'Student' as UserRole,
      title: 'Student',
      description: 'Learning and assessment',
      icon: GraduationCap,
      color: 'bg-purple-500',
      route: '/academic/student',
    },
    {
      id: 'TA' as UserRole,
      title: 'Teaching Assistant',
      description: 'Faculty support and grading',
      icon: UserCircle,
      color: 'bg-orange-500',
      route: '/academic/ta',
    },
    {
      id: 'Reviewer' as UserRole,
      title: 'Reviewer / Auditor',
      description: 'Quality assurance and compliance',
      icon: FileCheck,
      color: 'bg-indigo-500',
      route: '/academic/reviewer',
    },
  ];

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role.id);
    setTimeout(() => {
      navigate(role.route);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Winnify Academic LMS</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-Powered Learning Management System for Outcome-Based Education
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Select Your Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedRole === role.id ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`${role.color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'AI Content Generation',
                description: 'Automatically generate lecture notes, quizzes, and resources',
              },
              {
                title: 'Outcome-Based Education',
                description: 'CO-PO-PSO mapping and attainment tracking',
              },
              {
                title: 'Real-time Analytics',
                description: 'Track student performance and course progress',
              },
              {
                title: 'Approval Workflows',
                description: 'Multi-level review and approval processes',
              },
              {
                title: 'Smart Notifications',
                description: 'Real-time alerts for lectures, quizzes, and deadlines',
              },
              {
                title: 'Comprehensive Reporting',
                description: 'Accreditation-ready reports and analytics',
              },
            ].map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Winnify Academic LMS • Built for Excellence in Education</p>
          <p className="mt-2">Mock Frontend Implementation • All personas and workflows included</p>
        </div>
      </div>
    </div>
  );
}
