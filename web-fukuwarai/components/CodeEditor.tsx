"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const difficultyLevels = {
  easy: ["a = 1", "b = 2", "c = a + b", "print(c)"],
  normal: ["def add(x, y):", "    return x + y", "result = add(2, 3)", "print(result)"],
  hard: ["class Hello:", "    def say_hello(self):", "        print('Hello, world!')", "obj = Hello()", "obj.say_hello()"],
};

const codeExplanations: Record<string, string> = {
  print: "print: 画面に出力する命令",
  def: "def: 新しい関数を定義する",
  return: "return: 関数の結果を返す",
  class: "class: 新しいクラスを作成する",
  self: "self: クラスの中で自分自身を指す",
  obj: "obj: クラスのインスタンス",
  say_hello: "say_hello: 関数の名前",
  add: "add: 2つの数を足す関数",
};

export default function CodeEditor() {
  const [difficulty, setDifficulty] = useState<keyof typeof difficultyLevels>("easy");
  const [codeLines, setCodeLines] = useState<{ id: string; text: string }[]>([]); // id を追加
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setCodeLines(shuffleArray(difficultyLevels[difficulty].map((text, i) => ({ id: `${difficulty}-${i}`, text }))));
  }, [difficulty]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(codeLines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCodeLines(items);
  };

  const changeDifficulty = (level: keyof typeof difficultyLevels) => {
    setDifficulty(level);
    setOutput("");
  };

  function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const shuffleCode = () => {
    setCodeLines(shuffleArray([...codeLines]));
  };

  const runCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      const code = codeLines.map((line) => line.text).join("\n");

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
      <h2 className="text-xl font-bold mb-4">コードを並び替えてください</h2>

      {/* 難易度選択 */}
      <div className="mb-4 space-x-2">
        {Object.keys(difficultyLevels).map((level) => (
          <button
            key={level}
            onClick={() => changeDifficulty(level as keyof typeof difficultyLevels)}
            className={`px-3 py-1 rounded ${difficulty === level ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {level.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 並び替えリセットボタン */}
      <button onClick={shuffleCode} className="mb-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
        🔄 並び替えをリセット
      </button>

      {/* ドラッグ＆ドロップのコード並び替えエリア */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="code">
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps} className="bg-white p-2 rounded-md border">
              {codeLines.map((line, index) => {
                const explanations = Object.keys(codeExplanations)
                  .filter((key) => line.text.includes(key))
                  .map((key) => codeExplanations[key]);

                return (
                  <Draggable key={line.id} draggableId={line.id} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-2 border-b last:border-none bg-gray-50 cursor-grab group relative whitespace-pre"
                      >
                        {line.text}
                        {/* ツールチップ表示 */}
                        {explanations.length > 0 && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1 mt-1 p-2 bg-black text-white text-xs rounded shadow-lg w-max max-w-xs min-w-[150px] break-words hidden group-hover:block z-50">
                            {explanations.join(" / ")}
                          </div>
                        )}
                      </li>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {/* 実行ボタン */}
      <button
        onClick={runCode}
        className={`mt-4 px-4 py-2 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
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
