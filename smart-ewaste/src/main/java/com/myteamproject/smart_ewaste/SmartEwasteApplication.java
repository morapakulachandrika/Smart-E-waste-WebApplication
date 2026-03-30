package com.myteamproject.smart_ewaste;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartEwasteApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartEwasteApplication.class, args);
    }
}
