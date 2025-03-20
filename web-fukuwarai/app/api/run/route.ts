import { NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(req: Request) {
  const { code } = await req.json();
  
  return new Promise((resolve) => {
    exec(`python3 -c "${code.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
      resolve(NextResponse.json({ output: stdout || stderr }));
    });
  });
}
