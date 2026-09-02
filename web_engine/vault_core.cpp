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

class secure {

private:
    std::string secure_key;

public:
    secure(std::string key) : secure_key(key) {}
    
    std::string transform(const std::string& input, const std::string& namak) const {
        if (input.empty()) return "";

        std::string combined_key = secure_key + namak;
        size_t key_len = combined_key.length();
        std::string output = input;

        for (size_t i = 0; i < input.length(); ++i) {
            output[i] = input[i] ^ combined_key[i % key_len] ^ static_cast<char>(i & 0xFF);
        }
    return output;
    }
    
};

std::string anonymize_patient(const std::string& raw_id, const std::string& namak) {
    unsigned long hash = 5381;
    std::string combined = raw_id + namak;

    for (char c : combined) {
        hash = ((hash << 5) + hash) + static_cast<unsigned char> (c);
    }
    return "anon_" + std::to_string(hash);
}

int main(void) {
    // A. Create patient record
    TelementryRecord record(1001, 895.5f, 340.0f);

    // B. Setup cipher engine
    std::string master_secret = "SIH_KEY_2026";
    std::string session_salt = "Session_Alpha";
     secure data_key(master_secret);

    // C. Serialize telemetry data
    std::string raw_json = record.to_json_string();
    std::cout << "1. Plaintext JSON Payload:\n   " << raw_json << "\n\n";

    // D. Encrypt using CipherEngine
    std::string encrypted_payload = data_key.transform(raw_json, session_salt);
    std::cout << "2. Encrypted Ciphertext:\n   " << encrypted_payload << "\n\n";

    // E. Decrypt using identical operation
    std::string decrypted_payload = data_key.transform(encrypted_payload, session_salt);
    std::cout << "3. Decrypted Payload Verification:\n   " << decrypted_payload << "\n\n";

    // F. Anonymize user ID
    std::string anon_id = anonymize_patient("PATIENT_XYZ_98", session_salt);
    std::cout << "4. Anonymized User ID:\n   " << anon_id << "\n";

    return 0;

}