// Handler decorator for analytics: composes "track, then run the handler" so a
// call site stays a one-liner. The payload may be a static object or a function
// of the handler arguments when it depends on runtime values.
//
//   <button onClick={withTrack('app_cta_click', { placement: 'result' }, handleClick)}>
//   <button onClick={withTrack('question_answered',
//       () => ({ questionId, choiceId, index }), onAnswer)}>

import type { AnalyticsEventName, PayloadOf } from '@/shared/analytics/events'
import { trackEvent } from '@/shared/analytics/track'

export function withTrack<N extends AnalyticsEventName, Args extends unknown[]>(
    name: N,
    payload: PayloadOf<N> | ((...args: Args) => PayloadOf<N>),
    handler?: (...args: Args) => void,
): (...args: Args) => void {
    return (...args: Args) => {
        // Payloads are plain objects, so a function value can only be the lazy
        // payload factory variant.
        const resolved =
            typeof payload === 'function'
                ? (payload as (...args: Args) => PayloadOf<N>)(...args)
                : payload
        trackEvent(name, resolved)
        handler?.(...args)
    }
}
