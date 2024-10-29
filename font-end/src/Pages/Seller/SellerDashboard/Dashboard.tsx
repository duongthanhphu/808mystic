import {
  Grid,
  Paper,
  Text,
  Group,
  SimpleGrid,
} from "@mantine/core";
import {
  IconUsers,
  IconBox,
  IconClipboardList,
  IconTruck,
  IconStar,
  IconPercentage,
  IconBuildingStore,
  IconApple,
} from "@tabler/icons-react";
import { LineChart, BarChart } from "@mantine/charts";

export default function SellerDashboard() {
  const stats = [
    {
      title: "Tổng số khách hàng",
      value: "2",
      icon: IconUsers,
      color: "rgb(219, 234, 254)", // blue-100
      textColor: "rgb(29, 78, 216)", // blue-700
    },
    {
      title: "Tổng số sản phẩm",
      value: "101",
      icon: IconBox,
      color: "rgb(254, 235, 200)", // orange-100
      textColor: "rgb(237, 137, 54)", // orange-500
    },
    {
      title: "Tổng số đơn hàng",
      value: "3",
      icon: IconClipboardList,
      color: "rgb(198, 246, 213)", // green-100
      textColor: "rgb(56, 161, 105)", // green-600
    },
    {
      title: "Tổng số vận đơn",
      value: "1",
      icon: IconTruck,
      color: "rgb(254, 215, 226)", // pink-100
      textColor: "rgb(213, 63, 140)", // pink-600
    },
    {
      title: "Tổng số đánh giá",
      value: "1",
      icon: IconStar,
      color: "rgb(254, 252, 191)", // yellow-100
      textColor: "rgb(236, 201, 75)", // yellow-400
    },
    {
      title: "Tổng số khuyến mãi hiện tại",
      value: "0",
      icon: IconPercentage,
      color: "rgb(254, 215, 215)", // red-100
      textColor: "rgb(229, 62, 62)", // red-600
    },
    {
      title: "Tổng số nhà cung cấp",
      value: "5",
      icon: IconBuildingStore,
      color: "rgb(237, 233, 254)", // purple-100
      textColor: "rgb(124, 58, 237)", // purple-600
    },
    {
      title: "Tổng số thương hiệu",
      value: "50",
      icon: IconApple,
      color: "rgb(219, 234, 254)", // blue-100
      textColor: "rgb(29, 78, 216)", // blue-700
    },
  ];

  // Mock data cho biểu đồ
  const accountRegistrations = [
    { date: "05/10/21", value: 0 },
    { date: "01/12/21", value: 0 },
    { date: "08/01/22", value: 0 },
    { date: "27/01/22", value: 0 },
    { date: "27/03/22", value: 1 },
  ];

  const orderStats = [
    { date: "03/05/22", value: 1 },
    { date: "30/06/22", value: 1 },
    { date: "29/03/23", value: 1 },
  ];

  return (
    <div className="p-6">
      <Text size="xl" fw={700} className="mb-2">
        Thống kê hệ thống
      </Text>
      <Text size="sm" c="dimmed" className="mb-6">
        Tổng quan
      </Text>

      <SimpleGrid cols={4} spacing="lg" className="mb-8">
        {stats.map((stat, index) => (
          <Paper key={index} radius="md" className="overflow-hidden" withBorder>
            <div style={{ backgroundColor: stat.color }} className="p-4">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="xs" c="dimmed" className="mb-1">
                    {stat.title}
                  </Text>
                  <Text fw={700} size="xl" style={{ color: stat.textColor }}>
                    {stat.value}
                  </Text>
                </div>
                <div className="bg-white p-2 rounded-full">
                  <stat.icon size={20} style={{ color: stat.textColor }} />
                </div>
              </Group>
            </div>
          </Paper>
        ))}
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={6}>
          <Paper radius="md" p="md" withBorder>
            <Group justify="space-between" className="mb-4">
              <Text fw={500}>Lượt đăng ký tài khoản</Text>
              <Text size="xs" c="dimmed">
                7 ngày gần nhất
              </Text>
            </Group>
            <LineChart
              h={300}
              data={accountRegistrations}
              dataKey="date"
              series={[{ name: "value", color: "blue.6" }]}
              curveType="monotone"
              gridAxis="xy"
              withLegend
              withTooltip
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={6}>
          <Paper radius="md" p="md" withBorder>
            <Group justify="space-between" className="mb-4">
              <Text fw={500}>Lượt đặt hàng</Text>
              <Text size="xs" c="dimmed">
                7 ngày gần nhất
              </Text>
            </Group>
            <BarChart
              h={300}
              data={orderStats}
              dataKey="date"
              series={[{ name: "value", color: "teal.6" }]}
              gridAxis="xy"
              withLegend
              withTooltip
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={6}>
          <Paper radius="md" p="md" withBorder>
            <Group justify="space-between" className="mb-4">
              <Text fw={500}>Lượt đánh giá sản phẩm</Text>
              <Text size="xs" c="dimmed">
                7 ngày gần nhất
              </Text>
            </Group>
            <LineChart
              h={300}
              data={accountRegistrations}
              dataKey="date"
              series={[{ name: "value", color: "violet.6" }]}
              curveType="monotone"
              gridAxis="xy"
              withLegend
              withTooltip
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={6}>
          <Paper radius="md" p="md" withBorder>
            <Group justify="space-between" className="mb-4">
              <Text fw={500}>Lượt tạo vận đơn</Text>
              <Text size="xs" c="dimmed">
                7 ngày gần nhất
              </Text>
            </Group>
            <BarChart
              h={300}
              data={orderStats}
              dataKey="date"
              series={[{ name: "value", color: "pink.6" }]}
              gridAxis="xy"
              withLegend
              withTooltip
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
}
