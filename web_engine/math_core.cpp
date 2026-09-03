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

// #include <iostream>
// #include <cmath>
// #include <algorithm>
// #include <vector>
// #include <emscripten/bind.h>

// using namespace emscripten;

// class CognitiveMathEngine
// {
// public:
//     /**
//      * Calculates the Cumulative Fatigue Index (CFI) across a sequence of moves.
//      * Evaluates slope of reaction time increases using simple linear regression.
//      */
//     static float calculate_fatigue_index(const std::vector<float> &reaction_times)
//     {
//         size_t n = reaction_times.size();
//         if (n < 3)
//             return 0.0f; // Need at least 3 moves to establish a trend

//         float sum_x = 0.0f, sum_y = 0.0f, sum_xy = 0.0f, sum_x2 = 0.0f;
//         for (size_t i = 0; i < n; ++i)
//         {
//             float x = static_cast<float>(i);
//             float y = reaction_times[i];
//             sum_x += x;
//             sum_y += y;
//             sum_xy += x * y;
//             sum_x2 += x * x;
//         }

//         // Calculate slope (m) of reaction times
//         float denominator = (n * sum_x2 - sum_x * sum_x);
//         if (std::abs(denominator) < 1e-5f)
//             return 0.0f;

//         float slope = (n * sum_xy - sum_x * sum_y) / denominator;

//         // Positive slope indicates increasing slowdown (fatigue)
//         return std::max(0.0f, slope);
//     }

//     /**
//      * Computes final cognitive session score (0.0 to 100.0) combining:
//      * - Base accuracy ratio
//      * - Exponential error decay (penalizing repeated errors heavier)
//      * - Fatigue penalty factor
//      */
//     static float calculate_session_score(float base_score, float avg_rt_ms, int unique_errors, int repeated_errors, float fatigue_index)
//     {
//         const float ERROR_LAMBDA = 0.15f;
//         const float REPEAT_LAMBDA = 0.35f; // Repeated mistakes penalty multiplier
//         const float FATIGUE_WEIGHT = 0.05f;

//         // 1. Calculate error penalties
//         float total_error_penalty = (ERROR_LAMBDA * unique_errors) + (REPEAT_LAMBDA * repeated_errors);
//         float error_factor = std::exp(-total_error_penalty);

//         // 2. Calculate fatigue penalty
//         float fatigue_penalty = 1.0f / (1.0f + (FATIGUE_WEIGHT * fatigue_index));

//         // 3. Final composite score
//         float final_score = base_score * error_factor * fatigue_penalty;
//         return std::max(0.0f, std::min(100.0f, final_score));
//     }
// };

// // Expose C++ methods directly to JS via Embind
// EMSCRIPTEN_BINDINGS(math_module)
// {
//     register_vector<float>("VectorFloat");

//     class_<CognitiveMathEngine>("CognitiveMathEngine")
//         .class_function("calculate_fatigue_index", &CognitiveMathEngine::calculate_fatigue_index)
//         .class_function("calculate_session_score", &CognitiveMathEngine::calculate_session_score);
// }
