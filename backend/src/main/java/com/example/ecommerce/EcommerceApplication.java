package com.example.ecommerce;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EcommerceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }

    @Bean
    CommandLineRunner seed(ProductRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Product(null, "Laptop", 79999.00, "Developer laptop"));
                repository.save(new Product(null, "Mechanical Keyboard", 5999.00, "RGB mechanical keyboard"));
                repository.save(new Product(null, "Wireless Mouse", 1999.00, "Ergonomic wireless mouse"));
            }
        };
    }
}
