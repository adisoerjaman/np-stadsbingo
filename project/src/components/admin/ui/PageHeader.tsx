interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">{title}</h1>
      <p className="text-[#4B5563]">{subtitle}</p>
    </div>
  );
}
