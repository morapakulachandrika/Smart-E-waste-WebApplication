// package com.myteamproject.smart_ewaste.config;

// import com.myteamproject.smart_ewaste.security.JwtAuthFilter;
// import com.myteamproject.smart_ewaste.security.PickupAgentDetailsService;

// import lombok.RequiredArgsConstructor;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// import org.springframework.web.cors.CorsConfiguration;

// @Configuration
// @RequiredArgsConstructor
// @EnableMethodSecurity
// public class SecurityConfig {

//         private final JwtAuthFilter jwtAuthFilter;
//         private final PickupAgentDetailsService pickupAgentDetailsService;

//         @Bean
//         public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

//                 http
//                                 .csrf(csrf -> csrf.disable())
//                                 .cors(cors -> cors.configurationSource(request -> {
//                                         CorsConfiguration config = new CorsConfiguration();
//                                         config.addAllowedOrigin("*");
//                                         config.addAllowedHeader("*");
//                                         config.addAllowedMethod("*");
//                                         return config;
//                                 }))
//                                 .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

//                                 .authenticationProvider(pickupAgentAuthProvider())

//                                 .authorizeHttpRequests(auth -> auth

//                                                 // ✅ PUBLIC (NO AUTH REQUIRED)
//                                                 .requestMatchers(
//                                                                 "/",
//                                                                 "/uploads/**",
//                                                                 "/api/auth/register",
//                                                                 "/api/auth/login",
//                                                                 "/api/auth/forgot-password",
//                                                                 "/api/auth/reset-password",
//                                                                 "/api/pickup-agent/auth/login",
//                                                                 "/test-email")
//                                                 .permitAll()

//                                                 // ✅ Any logged-in user
//                                                 .requestMatchers("/api/auth/currentUser").authenticated()

//                                                 // ✅ ADMIN APIs
//                                                 .requestMatchers(
//                                                                 "/api/requests/admin/**",
//                                                                 "/api/requests/*/status",
//                                                                 "/api/pickup-agent/admin/**")
//                                                 .hasRole("ADMIN")

//                                                 // ✅ PICKUP AGENT
//                                                 .requestMatchers(
//                                                                 "/api/pickup-agent/**")
//                                                 .hasRole("PICKUP_AGENT")

//                                                 // ✅ USER APIs
//                                                 .requestMatchers(
//                                                                 "/api/requests/create",
//                                                                 "/api/requests/user/**",
//                                                                 "/api/user/**")
//                                                 .hasRole("USER")

//                                                 // ✅ Everything else
//                                                 .anyRequest().authenticated())

//                                 .exceptionHandling(ex -> ex.authenticationEntryPoint(new Http403ForbiddenEntryPoint()))
//                                 .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

//                 return http.build();
//         }

//         @Bean
//         public PasswordEncoder passwordEncoder() {
//                 return new BCryptPasswordEncoder();
//         }

//         @Bean
//         public AuthenticationManager authenticationManager(
//                         AuthenticationConfiguration config) throws Exception {
//                 return config.getAuthenticationManager();
//         }

//         @Bean
//         public DaoAuthenticationProvider pickupAgentAuthProvider() {
//                 DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
//                 provider.setUserDetailsService(pickupAgentDetailsService);
//                 provider.setPasswordEncoder(passwordEncoder());
//                 return provider;
//         }
// }
package com.myteamproject.smart_ewaste.config;

import com.myteamproject.smart_ewaste.security.JwtAuthFilter;
import com.myteamproject.smart_ewaste.security.PickupAgentDetailsService;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;
        private final PickupAgentDetailsService pickupAgentDetailsService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(request -> {
                                        CorsConfiguration config = new CorsConfiguration();
                                        config.addAllowedOrigin("*");
                                        config.addAllowedHeader("*");
                                        config.addAllowedMethod("*");
                                        return config;
                                }))
                                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .authenticationProvider(pickupAgentAuthProvider())

                                .authorizeHttpRequests(auth -> auth

                                                // ✅ PUBLIC (NO AUTH REQUIRED)
                                                .requestMatchers(
                                                                "/",
                                                                "/uploads/**",
                                                                "/api/auth/register",
                                                                "/api/auth/login",
                                                                "/api/auth/forgot-password",
                                                                "/api/auth/reset-password",
                                                                "/api/pickup-agent/auth/login",
                                                                "/test-email")
                                                .permitAll()

                                                // ✅ Any logged-in user
                                                .requestMatchers("/api/auth/currentUser").authenticated()

                                                // ✅ ADMIN APIs
                                                .requestMatchers(
                                                                "/api/requests/admin/**",
                                                                "/api/requests/*/status",
                                                                "/api/pickup-agent/admin/**")
                                                .hasRole("ADMIN")

                                                // ✅ PICKUP AGENT
                                                .requestMatchers(
                                                                "/api/pickup-agent/**")
                                                .hasRole("PICKUP_AGENT")

                                                // ✅ USER APIs
                                                .requestMatchers(
                                                                "/api/requests/create",
                                                                "/api/requests/user/**",
                                                                "/api/user/**")
                                                .hasRole("USER")

                                                // ✅ Everything else
                                                .anyRequest().authenticated())

                                .exceptionHandling(ex -> ex.authenticationEntryPoint(new Http403ForbiddenEntryPoint()))
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public DaoAuthenticationProvider pickupAgentAuthProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(pickupAgentDetailsService);
                provider.setPasswordEncoder(passwordEncoder());
                return provider;
        }
}
