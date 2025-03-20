import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST(req: Request) {
  try {
    const { code } = await req.json(); // フロントから送られたPythonコードを受け取る
    if (!code) {
      return NextResponse.json({ error: "コードが空です" }, { status: 400 });
    }

    // Python コードを実行する
    const { stdout, stderr } = await execPromise(`python3 -c "${code}"`); // 文字列でコードを直接渡す

    // エラーメッセージがあれば返す
    if (stderr || stdout.includes("Error")) {
      return NextResponse.json({ error: stderr || stdout }, { status: 400 });
    }

    return NextResponse.json({ output: stdout }); // 実行結果を返す
  } catch (error) {
    console.error(error); // エラー内容をログに出力
    return NextResponse.json({ error: "Python 実行エラー" }, { status: 500 });
  }
}
