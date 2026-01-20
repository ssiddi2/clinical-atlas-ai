import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock, UserPlus, Ban } from "lucide-react";

interface AdminStatsProps {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
  pendingApproval?: number;
  approved?: number;
  suspended?: number;
}

const AdminStats = ({ 
  pending, 
  verified, 
  rejected, 
  total,
  pendingApproval = 0,
  approved = 0,
  suspended = 0,
}: AdminStatsProps) => {
  const accountStats = [
    {
      title: "Pending Approval",
      value: pendingApproval,
      icon: UserPlus,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Approved Accounts",
      value: approved,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Suspended",
      value: suspended,
      icon: Ban,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Total Users",
      value: total,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const verificationStats = [
    {
      title: "Pending Verification",
      value: pending,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Verified Students",
      value: verified,
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: UserX,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Account Approval Stats */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Account Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accountStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Verification Stats */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Document Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {verificationStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
