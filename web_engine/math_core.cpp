#include <iostream>
#include <emscripten.h>

extern "C"
{

    EMSCRIPTEN_KEEPALIVE
    float calculate_score(float base_score, float reaction_time_ms)
    {
        float penalty = reaction_time_ms * 0.1f;
        float final_score = base_score - penalty;

        if (final_score < 0)
        {
            return 0.0f;
        }
        return final_score;
    }
}