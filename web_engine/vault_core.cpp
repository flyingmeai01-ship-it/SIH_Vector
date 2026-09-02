#include <iostream>
#include <string>

class TelementryRecord {

private:
    int user_id;
    float reaction_time_ms;
    float score;

public:
    TelementryRecord() : user_id(0), reaction_time_ms(0.0f), score(0.0f) {}

    TelementryRecord(int id, float time_ms, float num_score) {
        set_user_id(id);
        set_reaction_time(time_ms);
        set_score(num_score);
    }

    void set_user_id(int id) {
        user_id = id;
        return;
    }
    void set_reaction_time(float time_ms) {
        reaction_time_ms = time_ms;
        return;
    }
    void set_score(float num_score) {
        score = num_score;
        return;
    }

    int get_user_id() const {return user_id;}
    float get_reaction_time() const {return reaction_time_ms;}
    float get_score() const {return score;}

    std::string to_json_string() const {
        return "{\"user_id\":" + std::to_string(user_id) + 
        ",\"reaction_time_ms\":" + std::to_string(reaction_time_ms) + 
        ",\"score\":" + std::to_string(score) + "}";
    }


};

int main(void) {
    TelementryRecord record(1001, 950.5f, 320.0f);

    record.set_score(980.0f);

    std::string json_data = record.to_json_string();
    std::cout << "Serialized Class Data: " << json_data << "\n";

    return 0;

}