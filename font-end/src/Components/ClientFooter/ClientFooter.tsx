import { Text, Container, ActionIcon, Group, rem } from "@mantine/core";
import {
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandInstagram,
} from "@tabler/icons-react";
import { MantineLogo } from "@mantinex/mantine-logo";
import { Link } from "react-router-dom";

const data = [
  {
    title: "About",
    links: [
      { label: "Features", link: "#" },
      { label: "Pricing", link: "#" },
      { label: "Support", link: "#" },
      { label: "Forums", link: "#" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Contribute", link: "#" },
      { label: "Media assets", link: "#" },
      { label: "Changelog", link: "#" },
      { label: "Releases", link: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Join Discord", link: "#" },
      { label: "Follow on Twitter", link: "#" },
      { label: "Email newsletter", link: "#" },
      { label: "GitHub discussions", link: "#" },
    ],
  },
];

export default function ClientFooter() {
  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text<"a">
        key={index}
        className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
        component="a"
        href={link.link}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className="mr-10" key={group.title}>
        <Text fw={500} className=" mb-2 text-xl">
          {group.title}
        </Text>{" "}
        {links}
      </div>
    );
  });

  return (
    <footer className="bg-gray-100 py-10">
      <Container className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex flex-col items-start">
          <MantineLogo size={35} />
          <Text size="xs" className="text-gray-500 mt-2 pl-12">
            <Link to="seller-register">Đăng ký làm người bán</Link>
          </Text>
        </div>

              
        <div className="flex flex-grow justify-end">{groups}</div>
      </Container>
      <Container className="flex justify-center items-center mt-10 border-t pt-4 border-gray-300">
        <Text className="text-gray-500 text-sm">
          © 2020 mantine.dev. All rights reserved.
        </Text>

        <Group gap={0} className="justify-end">
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandTwitter
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandYoutube
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandInstagram
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
}
