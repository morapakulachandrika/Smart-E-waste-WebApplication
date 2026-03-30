package com.myteamproject.smart_ewaste.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class EmailTemplateService {

    public String loadTemplate(String templateName, Map<String, String> variables) {
        try {
            ClassPathResource resource =
                    new ClassPathResource("templates/email/" + templateName);

            InputStream inputStream = resource.getInputStream();
            String template = new String(
                    inputStream.readAllBytes(),
                    StandardCharsets.UTF_8
            );

            for (Map.Entry<String, String> entry : variables.entrySet()) {
                template = template.replace(
                        "{{" + entry.getKey() + "}}",
                        entry.getValue()
                );
            }

            return template;

        } catch (Exception e) {
            throw new RuntimeException("Failed to load email template: " + templateName, e);
        }
    }
}
