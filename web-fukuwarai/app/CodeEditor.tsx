"use client";

import { useState } from "react";

export default function CodeEditor() {
  const [code, setCode] = useState<string>("print('Hello, World!')");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const runCode = async () => {
    setLoading(true);
    setOutput(""); // 実行前に出力をクリア

    try {
      const response = await fetch("/api/run-python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (data.error) {
        setOutput(`❌ エラー: ${data.error}`);
      } else {
        setOutput(`✅ 実行結果:\n${data.output}`);
      }
    } catch (error) {
      setOutput("⚠️ サーバーエラーが発生しました");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Python コードエディタ</h2>

      {/* コード入力エリア */}
      <textarea
        className="w-full h-40 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Pythonコードを入力してください"
      />

      {/* 実行ボタン */}
      <button
        onClick={runCode}
        className={`mt-3 px-4 py-2 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
        disabled={loading}
      >
        {loading ? "実行中..." : "▶ 実行"}
      </button>

      {/* 実行結果エリア */}
      {output && (
        <pre className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded text-sm whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </div>
  );
}
