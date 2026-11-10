package com.yosr.tickets.workflow;

import com.yosr.tickets.model.Ticket;
import com.yosr.tickets.repository.TicketRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Bean called from the BPMN service tasks, e.g.
 * ${ticketWorkflow.setStatus(execution, 'RESOLVED')}
 */
@Component("ticketWorkflow")
public class TicketWorkflow {

    private static final Logger log = LoggerFactory.getLogger(TicketWorkflow.class);
    private final TicketRepository repository;

    public TicketWorkflow(TicketRepository repository) {
        this.repository = repository;
    }

    public void setStatus(DelegateExecution execution, String status) {
        Long ticketId = (Long) execution.getVariable("ticketId");
        repository.findById(ticketId).ifPresent(ticket -> {
            ticket.setStatus(Ticket.Status.valueOf(status));
            repository.save(ticket);
            log.info("Ticket {} -> {}", ticketId, status);
        });
    }

    /** Called by the timer boundary event when a ticket waits too long. */
    public void escalate(DelegateExecution execution) {
        setStatus(execution, "ESCALATED");
        log.warn("SLA exceeded: ticket {} escalated, notify the senior team here",
                execution.getVariable("ticketId"));
    }
}
