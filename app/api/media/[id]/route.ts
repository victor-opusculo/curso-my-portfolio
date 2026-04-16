import { RowNotFound } from "@/lib/database/errors";
import { getStream } from "@/lib/media/media";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = Number.parseInt((await params).id);

    try {
        const { stream, extension, mime } = await getStream(id);

        //@ts-ignore
        const response = new NextResponse(stream);
        response.headers.append('Content-Type', mime);
        response.headers.append(
            'Content-Disposition',
            `filename="midia${extension}"`
        );

        return response;
    } catch (err) {
        return NextResponse.json(
            {
                error:
                    err instanceof RowNotFound
                        ? 'Mídia não localizada!'
                        : 'Erro ao carregar mídia',
            },
            { status: 404 }
        );
    }
}