import type {
    ScientificTheGraphHttpRequest,
    ScientificTheGraphHttpResponse,
    ScientificTheGraphTransport
} from "./ScientificTheGraphProvider.js";


export class ScientificTheGraphFetchTransport
implements ScientificTheGraphTransport {

    async post(
        request:
            ScientificTheGraphHttpRequest
    ): Promise<ScientificTheGraphHttpResponse> {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () =>
                    controller.abort(),
                request.timeoutMs
            );


        try {

            const response =
                await fetch(
                    request.url,
                    {

                        method:
                            "POST",

                        headers:
                            request.headers,

                        body:
                            request.body,

                        signal:
                            controller.signal

                    }
                );


            return {

                status:
                    response.status,

                body:
                    await response.text()

            };

        }
        finally {

            clearTimeout(
                timeout
            );

        }

    }

}