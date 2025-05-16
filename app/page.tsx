"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [mintAddress, setMintAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [error, setError] = useState("");

  const isValidSolanaAddress = (address: string) => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  };

  const handleGenerateBlink = () => {
    if (mintAddress && recipientAddress) {
      if (!isValidSolanaAddress(mintAddress)) {
        setError("Invalid mint address");
        return;
      }
      if (!isValidSolanaAddress(recipientAddress)) {
        setError("Invalid recipient address");
        return;
      }
      const url = `https://solanablinks.me/api/actions/transfer?recipient=${recipientAddress}&mint=${mintAddress}`;
      setGeneratedLink(url);
      setError("");
    }

    if (recipientAddress) {
      if (!isValidSolanaAddress(recipientAddress)) {
        setError("Invalid recipient address");
        return;
      }
      const url = `https://solanablinks.me/api/actions/transfer?recipient=${recipientAddress}`;
      setGeneratedLink(url);
      setError("");
    }
  };

  const generateTwitterIntentURL = (link: string) => {
    const text = encodeURIComponent(
      `Easily send me compressed tokens with this Blink link \n${link}`,
    );
    return `https://twitter.com/intent/tweet?text=${text}`;
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Compressed Token Blinks
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        <Link
          href="https://x.com/3thris/status/1923262586960650349"
          target="_blank"
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-2xl shadow transition text-center"
        >
          Create CToken in a Blink
        </Link>
        <Link
          href="https://x.com/3thris/status/1923262589896720496"
          target="_blank"
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-2xl shadow transition text-center"
        >
          Mint CToken in a Blink
        </Link>
      </div>

      <div className="w-full max-w-lg bg-neutral-900 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Receive Compressed Tokens
        </h2>
        <input
          type="text"
          placeholder="Recipient Address"
          className="w-full mb-4 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
          value={recipientAddress}
          required
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mint Address"
          className="w-full mb-4 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          className="w-full bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-2xl transition"
          onClick={handleGenerateBlink}
        >
          Generate Blink URL
        </button>

        {generatedLink && (
          <div className="mt-4 text-center break-words">
            <p className="text-sm text-neutral-400">Generated Blink:</p>
            <a
              href={generatedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 underline"
            >
              {generatedLink}
            </a>
            <div className="mt-4">
              <a
                href={generateTwitterIntentURL(generatedLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-xl transition text-sm"
              >
                Share on Twitter
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
