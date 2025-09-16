import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ArrowLeft,
  Award,
  Calendar,
  Target,
  User,
  CheckCircle,
  Star,
  Trophy,
  Crown,
  Printer,
} from "lucide-react";

interface CertificateViewerProps {
  certificateId: number;
  onNavigate: (page: string) => void;
}

export function CertificateViewer({
  certificateId,
  onNavigate,
}: CertificateViewerProps) {
  // This would typically come from a prop or API call
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
      recipientName: "John Doe", // This would come from user data
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
      recipientName: "John Doe",
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
      recipientName: "John Doe",
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
      recipientName: "John Doe",
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
      recipientName: "John Doe",
    },
  ];

  const certificate = certificates.find((cert) => cert.id === certificateId);

  if (!certificate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => onNavigate("certificates")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Certificate not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCertificateIcon = (type: string) => {
    switch (type) {
      case "course":
        return <Award className="w-12 h-12 text-[#2e3f6f]" />;
      case "trivia":
        return <Trophy className="w-12 h-12 text-yellow-600" />;
      case "pathway":
        return <Crown className="w-12 h-12 text-purple-600" />;
      default:
        return <Award className="w-12 h-12 text-[#2e3f6f]" />;
    }
  };

  const getCertificateGradient = (type: string) => {
    switch (type) {
      case "course":
        return "pau-gradient";
      case "trivia":
        return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600";
      case "pathway":
        return "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700";
      default:
        return "pau-gradient";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would implement actual download functionality
    console.log("Downloading certificate...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => onNavigate("certificates")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Certificates
        </Button>

        <div className="flex items-center space-x-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} className="pau-gradient">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <div className="flex justify-center">
        <Card className="w-full max-w-4xl pau-shadow print:shadow-none print:border-0">
          <CardContent className="p-0">
            {/* Certificate Template */}
            <div className="relative bg-white border-8 border-[#2e3f6f] print:border-4">
              {/* Header Design */}
              <div
                className={`${getCertificateGradient(certificate.type)} p-8 text-white relative overflow-hidden`}
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        {getCertificateIcon(certificate.type)}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">
                          PAU Professional Learning
                        </h1>
                        <p className="text-lg text-white opacity-90">
                          Pan-Atlantic University
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-white text-[#2e3f6f] px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verified
                    </Badge>
                  </div>

                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-white mb-2">
                      Certificate of Achievement
                    </h2>
                    <p className="text-xl text-white opacity-90">
                      This certifies that
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-12 bg-gradient-to-b from-gray-50 to-white">
                {/* Recipient Name */}
                <div className="text-center mb-8">
                  <h3 className="text-5xl font-bold text-[#2e3f6f] mb-4 border-b-4 border-[#2e3f6f] inline-block pb-2">
                    {certificate.recipientName}
                  </h3>
                  <p className="text-xl text-gray-600 mt-4">
                    has successfully completed
                  </p>
                </div>

                {/* Course Information */}
                <div className="text-center mb-8">
                  <h4 className="text-3xl font-semibold text-[#2e3f6f] mb-4">
                    {certificate.title}
                  </h4>
                  <p className="text-lg text-gray-600 mb-2">
                    {certificate.course}
                  </p>
                  {certificate.instructor && (
                    <p className="text-md text-gray-500">
                      Instructed by {certificate.instructor}
                    </p>
                  )}
                </div>

                {/* Achievement Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-6 h-6 text-[#2e3f6f]" />
                    </div>
                    <p className="text-sm text-gray-500">Date Completed</p>
                    <p className="font-semibold text-[#2e3f6f]">
                      {formatDate(certificate.completedDate)}
                    </p>
                  </div>

                  {certificate.score && (
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-500">Final Score</p>
                      <p className="font-semibold text-green-600">
                        {certificate.score}%
                      </p>
                    </div>
                  )}

                  {certificate.duration && (
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-purple-600">
                        {certificate.duration}
                      </p>
                    </div>
                  )}

                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-500">Credential ID</p>
                    <p className="font-semibold text-orange-600 text-xs">
                      {certificate.credentialId}
                    </p>
                  </div>
                </div>

                {/* Skills Earned */}
                {certificate.skills && certificate.skills.length > 0 && (
                  <div className="mb-8">
                    <h5 className="text-lg font-semibold text-[#2e3f6f] mb-4 text-center">
                      Skills Demonstrated
                    </h5>
                    <div className="flex flex-wrap justify-center gap-2">
                      {certificate.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1 border-[#2e3f6f] text-[#2e3f6f]"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatures and Date */}
                <div className="border-t pt-8 mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="border-t border-gray-400 pt-2 mb-2 mx-8">
                        <p className="font-semibold text-[#2e3f6f]">
                          Dr. Patricia Adaora Okwu
                        </p>
                        <p className="text-sm text-gray-600">
                          Director, Professional Learning
                        </p>
                        <p className="text-sm text-gray-600">
                          Pan-Atlantic University
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="border-t border-gray-400 pt-2 mb-2 mx-8">
                        <p className="font-semibold text-[#2e3f6f]">
                          {formatDate(certificate.completedDate)}
                        </p>
                        <p className="text-sm text-gray-600">Date of Issue</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    This certificate can be verified at pau.edu.ng/verify using
                    credential ID: {certificate.credentialId}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    © {new Date().getFullYear()} Pan-Atlantic University. All
                    rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
