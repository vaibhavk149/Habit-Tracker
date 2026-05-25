import { NextResponse } from "next/server";
import { programs } from "@/lib/programs";
import { getIndiaClock, getIndiaDateKey, getIndiaDisplay } from "@/lib/time";

export async function GET() {
  return NextResponse.json({
    programs,
    indiaNow: {
      dateKey: getIndiaDateKey(),
      clock: getIndiaClock(),
      display: getIndiaDisplay(),
    },
  });
}
