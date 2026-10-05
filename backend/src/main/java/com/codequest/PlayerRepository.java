package com.codequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface PlayerRepository extends JpaRepository<Player,Long>{ Optional<Player> findByUsername(String username); List<Player> findTop50ByOrderByXpDesc(); }