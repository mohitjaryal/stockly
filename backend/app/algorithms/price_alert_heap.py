
from decimal import Decimal
from typing import Any, Literal


class PriceAlertHeap:
    """
    Custom Binary Heap for active stock price alerts.

    above: Min Heap (lowest target first)
    below: Max Heap (highest target first)
    """

    def __init__(
        self,
        condition: Literal["above", "below"],
        alerts: list[Any] | None = None,
    ):
        if condition not in ("above", "below"):
            raise ValueError("Condition must be 'above' or 'below'")

        self.condition = condition
        self.heap = list(alerts) if alerts else []

        # Build heap using bottom-up heap construction: O(n)
        for index in range(len(self.heap) // 2 - 1, -1, -1):
            self._heapify_down(index)

    def __len__(self):
        return len(self.heap)

    def is_empty(self):
        return len(self.heap) == 0

    def _has_priority(self, first, second):
        first_price = Decimal(str(first.target_price))
        second_price = Decimal(str(second.target_price))

        if self.condition == "above":
            return first_price < second_price

        return first_price > second_price

    def peek(self):
        if self.is_empty():
            return None
        return self.heap[0]

    def insert(self, alert):
        self.heap.append(alert)
        self._heapify_up(len(self.heap) - 1)

    def pop(self):
        if self.is_empty():
            return None

        if len(self.heap) == 1:
            return self.heap.pop()

        highest_priority = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._heapify_down(0)

        return highest_priority

    def _heapify_up(self, index):
        while index > 0:
            parent = (index - 1) // 2

            if not self._has_priority(
                self.heap[index], self.heap[parent]
            ):
                break

            self.heap[index], self.heap[parent] = (
                self.heap[parent],
                self.heap[index],
            )

            index = parent

    def _heapify_down(self, index):
        size = len(self.heap)

        while True:
            priority_index = index
            left = 2 * index + 1
            right = 2 * index + 2

            if (
                left < size
                and self._has_priority(
                    self.heap[left], self.heap[priority_index]
                )
            ):
                priority_index = left

            if (
                right < size
                and self._has_priority(
                    self.heap[right], self.heap[priority_index]
                )
            ):
                priority_index = right

            if priority_index == index:
                break

            self.heap[index], self.heap[priority_index] = (
                self.heap[priority_index],
                self.heap[index],
            )

            index = priority_index
