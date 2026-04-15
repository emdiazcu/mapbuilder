export default function Logo({ size = 56 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt="MapBuilder logo"
    />
  )
}