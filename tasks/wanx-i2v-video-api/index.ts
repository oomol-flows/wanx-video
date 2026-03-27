import type { Context } from "@oomol/types/oocana";

//#region generated meta
type Inputs = {
    image_url: string;
    prompt: string;
    model: "wan2.6-i2v-flash" | "wan2.6-i2v" | null;
    negative_prompt: string | null;
    duration: number | null;
    resolution: "720P" | "1080P" | null;
    prompt_extend: boolean | null;
    shot_type: "single" | "multi" | null;
    audio: boolean | null;
    audio_url: string | null;
    watermark: boolean | null;
    seed: number | null;
};
type Outputs = {
    video_url: string;
    task_id: string;
    resolution: string;
    audio: boolean;
    output_video_duration: number;
};
//#endregion

const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 600000;

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollForResult(sessionID: string, token: string): Promise<Outputs> {
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_WAIT_MS) {
        const response = await fetch(
            `https://fusion-api.oomol.com/v1/wanx-i2v-video/result/${sessionID}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json() as { error?: string };
            throw new Error(`Failed to get result: ${errorData.error || response.statusText}`);
        }

        const result = await response.json() as {
            success: boolean;
            state: "completed" | "processing";
            data?: {
                videoURL: string;
                taskId: string;
                resolution: string;
                audio: boolean;
                outputVideoDuration: number;
            };
        };

        if (result.state === "completed" && result.data?.videoURL) {
            return {
                video_url: result.data.videoURL,
                task_id: result.data.taskId,
                resolution: result.data.resolution,
                audio: result.data.audio,
                output_video_duration: result.data.outputVideoDuration,
            };
        }

        await sleep(POLL_INTERVAL_MS);
    }

    throw new Error("Video generation timed out after 10 minutes");
}

export default async function (
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Outputs> {
    const token = await context.getOomolToken();
    if (!token) {
        throw new Error("Failed to obtain OOMOL authentication token");
    }

    const requestBody: Record<string, unknown> = {
        imageURL: params.image_url,
        prompt: params.prompt,
    };

    if (params.model != null) {
        requestBody.model = params.model;
    }
    if (params.negative_prompt != null) {
        requestBody.negativePrompt = params.negative_prompt;
    }
    if (params.duration != null) {
        requestBody.duration = params.duration;
    }
    if (params.resolution != null) {
        requestBody.resolution = params.resolution;
    }
    if (params.prompt_extend != null) {
        requestBody.promptExtend = params.prompt_extend;
    }
    if (params.shot_type != null) {
        requestBody.shotType = params.shot_type;
    }
    if (params.audio != null) {
        requestBody.audio = params.audio;
    }
    if (params.audio_url != null) {
        requestBody.audioURL = params.audio_url;
    }
    if (params.watermark != null) {
        requestBody.watermark = params.watermark;
    }
    if (params.seed != null) {
        requestBody.seed = params.seed;
    }

    const submitResponse = await fetch(
        "https://fusion-api.oomol.com/v1/wanx-i2v-video/submit",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        }
    );

    if (!submitResponse.ok) {
        const errorData = await submitResponse.json() as { error?: string };
        throw new Error(`Failed to submit task: ${errorData.error || submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json() as {
        success: boolean;
        sessionID: string;
    };

    if (!submitData.success || !submitData.sessionID) {
        throw new Error("Failed to get session ID from submit response");
    }

    return pollForResult(submitData.sessionID, token);
}