package com.yosr.tickets.service;

import com.yosr.tickets.model.Ticket;
import com.yosr.tickets.repository.TicketRepository;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class TicketService {

    private final TicketRepository repository;
    private final RuntimeService runtimeService;

    public TicketService(TicketRepository repository, RuntimeService runtimeService) {
        this.repository = repository;
        this.runtimeService = runtimeService;
    }

    @Transactional
    public Ticket create(String title, String description, Ticket.Priority priority) {
        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setPriority(priority == null ? Ticket.Priority.LOW : priority);
        ticket = repository.save(ticket);

        ProcessInstance instance = runtimeService.startProcessInstanceByKey(
                "ticket-process",
                String.valueOf(ticket.getId()),
                Map.of("ticketId", ticket.getId(), "priority", ticket.getPriority().name()));

        ticket.setProcessInstanceId(instance.getId());
        return repository.save(ticket);
    }

    public List<Ticket> findAll() {
        return repository.findAll();
    }

    @Transactional
    public void markInProgress(Long ticketId) {
        repository.findById(ticketId).ifPresent(t -> {
            t.setStatus(Ticket.Status.IN_PROGRESS);
            repository.save(t);
        });
    }
}
