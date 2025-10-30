import Button from "./Button";

export default function SidebarHeaderButton({ children, ...props }) {
  return (
    <Button size="sm" {...props}>
      {children}
    </Button>
  );
}
