import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({ include: { thumbnails: true } });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const room = await prisma.room.create({
      data: body,
    });
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const room = await prisma.room.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(room);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    await prisma.room.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}
