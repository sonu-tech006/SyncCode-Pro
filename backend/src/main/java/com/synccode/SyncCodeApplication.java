package com.synccode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class SyncCodeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SyncCodeApplication.class, args);
    }
}
