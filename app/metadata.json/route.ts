export async function GET() {
  const json = {
    name: "CTOKEN",
    symbol: "CTN",
    decimals: 9,
    description: "CTOKEN is a utility token for the Solana ecosystem.",
    image: "https://solanablinks.me/img.png",
  };

  return Response.json(json);
}
