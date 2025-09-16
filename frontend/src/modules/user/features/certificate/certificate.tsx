import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  Share,
  Calendar,
  CheckCircle,
  Star,
  Trophy,
  Medal,
  BookOpen,
  Target,
  Zap,
  Crown,
  Eye,
} from "lucide-react";

interface CertificatesProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function Certificates({ onNavigate }: CertificatesProps = {}) {
  const certificates = [
    {
      id: 1,
      title: "Digital Teaching Methods Certification",
      course: "Digital Teaching Methods",
      completedDate: "2024-12-15",
      score: 95,
      instructor: "Dr. Sarah Johnson",
      duration: "4 hours",
      credentialId: "PAU-DTM-2024-001235",
      status: "issued",
      type: "course",
      skills: ["Digital Pedagogy", "Online Learning", "Educational Technology"],
    },
    {
      id: 2,
      title: "Student Assessment Excellence",
      course: "Student Assessment Strategies",
      completedDate: "2024-12-10",
      score: 88,
      instructor: "Dr. James Wilson",
      duration: "3.5 hours",
      credentialId: "PAU-SAS-2024-001189",
      status: "issued",
      type: "course",
      skills: ["Assessment Design", "Rubric Creation", "Feedback Strategies"],
    },
    {
      id: 3,
      title: "Educational Psychology Fundamentals",
      course: "Educational Psychology Basics",
      completedDate: "2024-11-28",
      score: 92,
      instructor: "Prof. Lisa Anderson",
      duration: "3 hours",
      credentialId: "PAU-EPB-2024-001156",
      status: "issued",
      type: "course",
      skills: ["Learning Theory", "Cognitive Development", "Motivation"],
    },
    {
      id: 4,
      title: "December 2024 Trivia Champion",
      course: "Monthly Trivia Challenge",
      completedDate: "2024-12-31",
      score: 100,
      duration: "15 minutes",
      credentialId: "PAU-TRV-2024-DEC-003",
      status: "issued",
      type: "trivia",
      skills: ["General Education Knowledge"],
    },
    {
      id: 5,
      title: "Learning Pathway: Modern Educator",
      course: "Complete Modern Educator Track",
      completedDate: "2024-12-20",
      coursesCompleted: 5,
      totalHours: "18 hours",
      credentialId: "PAU-PATH-2024-ME-045",
      status: "issued",
      type: "pathway",
      skills: [
        "Digital Teaching",
        "Assessment",
        "Classroom Management",
        "Technology Integration",
        "Student Engagement",
      ],
    },
  ];

  const achievements = [
    {
      id: 1,
      name: "Quick Learner",
      description: "Complete a course in under 2 days",
      icon: "⚡",
      earned: true,
      earnedDate: "2024-12-15",
    },
    {
      id: 2,
      name: "Perfect Score",
      description: "Achieve 100% on any assessment",
      icon: "🎯",
      earned: true,
      earnedDate: "2024-12-31",
    },
    {
      id: 3,
      name: "Knowledge Seeker",
      description: "Complete 5 different courses",
      icon: "🔍",
      earned: true,
      earnedDate: "2024-12-20",
    },
    {
      id: 4,
      name: "Trivia Master",
      description: "Win monthly trivia challenge",
      icon: "🏆",
      earned: true,
      earnedDate: "2024-12-31",
    },
    {
      id: 5,
      name: "Streak Champion",
      description: "Maintain 10-day learning streak",
      icon: "🔥",
      earned: false,
      progress: 7,
    },
    {
      id: 6,
      name: "Mentor",
      description: "Help 5 colleagues with learning",
      icon: "👨‍🏫",
      earned: false,
      progress: 2,
    },
  ];

  const stats = {
    totalCertificates: certificates.filter((c) => c.status === "issued").length,
    totalHours: "28.5",
    averageScore: Math.round(
      certificates.reduce((acc, cert) => acc + (cert.score || 0), 0) /
        certificates.filter((c) => c.score).length
    ),
    achievementsEarned: achievements.filter((a) => a.earned).length,
  };

  const getCertificateIcon = (type: string) => {
    switch (type) {
      case "course":
        return <Award className="w-6 h-6 text-blue-600" />;
      case "trivia":
        return <Trophy className="w-6 h-6 text-yellow-600" />;
      case "pathway":
        return <Crown className="w-6 h-6 text-purple-600" />;
      default:
        return <Medal className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case "course":
        return "Course Certificate";
      case "trivia":
        return "Trivia Champion";
      case "pathway":
        return "Learning Pathway";
      default:
        return "Certificate";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Certificates & Achievements</h1>
          <p className="text-muted-foreground mt-1">
            Track your professional development milestones and download
            certificates
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Certificates
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalCertificates}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Learning Hours
                </p>
                <p className="text-2xl font-bold mt-2">{stats.totalHours}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Score
                </p>
                <p className="text-2xl font-bold mt-2">{stats.averageScore}%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Achievements
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.achievementsEarned}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificates */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-[#2e3f6f]" />
                Your Certificates
              </CardTitle>
              <CardDescription>
                Professional development certificates you've earned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getCertificateIcon(certificate.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">
                          {certificate.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {certificate.course}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(certificate.completedDate)}
                          </span>
                          {certificate.score && (
                            <span className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {certificate.score}% score
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Issued
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <p>Credential ID: {certificate.credentialId}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onNavigate?.("certificate-viewer", {
                              certificateId: certificate.id,
                            })
                          }
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" className="pau-gradient">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Achievements Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="pau-shadow">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download All Certificates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Zap className="w-4 h-4 mr-2" />
                View Transcript
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
