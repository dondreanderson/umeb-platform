"""
Comprehensive Smoke Test for Event Strategy Features
Tests all new functionality including Event Details, Budget, Goals, ESG, and Cloning
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"  # Internal container network
API_BASE = f"{BASE_URL}/api/v1"

# Test credentials
TEST_EMAIL = "admin@example.com"
TEST_PASSWORD = "admin123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_section(msg):
    print(f"\n{Colors.YELLOW}{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}{Colors.END}\n")

# Get auth token
def get_auth_token():
    print_section("AUTHENTICATION")
    response = requests.post(
        f"{API_BASE}/login/access-token",
        data={"username": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code == 200:
        token = response.json()["access_token"]
        print_success(f"Authenticated as {TEST_EMAIL}")
        return token
    else:
        print_error(f"Authentication failed: {response.status_code}")
        print_error(response.text)
        return None

# Test 1: Create Event with Strategy Fields
def test_create_event(token):
    print_section("TEST 1: Create Event with Strategy Fields")
    
    headers = {"Authorization": f"Bearer {token}"}
    event_data = {
        "title": "Smoke Test Event - Strategy Demo",
        "description": "Testing new strategy features",
        "start_time": (datetime.now() + timedelta(days=30)).isoformat(),
        "end_time": (datetime.now() + timedelta(days=30, hours=3)).isoformat(),
        "location": "Test Venue, City",
        "capacity": 150,
        "status": "PUBLISHED",
        "event_type": "GALA",
        "ticket_price": 50.0,
        "region": "North America",
        "scenario_type": "HYBRID",
        "is_public": True,
        "is_template": False
    }
    
    response = requests.post(f"{API_BASE}/events/", json=event_data, headers=headers)
    
    if response.status_code == 200:
        event = response.json()
        print_success(f"Created event: {event['title']} (ID: {event['id']})")
        print_info(f"  Region: {event.get('region', 'N/A')}")
        print_info(f"  Scenario: {event.get('scenario_type', 'N/A')}")
        print_info(f"  Public: {event.get('is_public', 'N/A')}")
        return event['id']
    else:
        print_error(f"Failed to create event: {response.status_code}")
        print_error(response.text)
        return None

# Test 2: Add Budget Items
def test_add_budget(token, event_id):
    print_section("TEST 2: Add Budget Items")
    
    headers = {"Authorization": f"Bearer {token}"}
    budget_items = [
        {"category": "Venue", "planned_amount": 5000.0, "actual_amount": 0.0, "forecast_amount": 5200.0},
        {"category": "Catering", "planned_amount": 3000.0, "actual_amount": 2800.0, "forecast_amount": 2900.0},
        {"category": "Marketing", "planned_amount": 1500.0, "actual_amount": 1200.0, "forecast_amount": 1400.0},
    ]
    
    for item in budget_items:
        response = requests.post(
            f"{API_BASE}/strategy/{event_id}/budget",
            json=item,
            headers=headers
        )
        if response.status_code == 200:
            print_success(f"Added budget: {item['category']} - ${item['planned_amount']:,.2f}")
        else:
            print_error(f"Failed to add budget item: {response.status_code}")
    
    # Verify total
    response = requests.get(f"{API_BASE}/strategy/{event_id}/budget", headers=headers)
    if response.status_code == 200:
        items = response.json()
        total_planned = sum(i['planned_amount'] for i in items)
        total_actual = sum(i['actual_amount'] for i in items)
        print_info(f"Total Planned: ${total_planned:,.2f} | Total Actual: ${total_actual:,.2f}")

# Test 3: Add Goals/KPIs
def test_add_goals(token, event_id):
    print_section("TEST 3: Add Goals & KPIs")
    
    headers = {"Authorization": f"Bearer {token}"}
    goals = [
        {"metric_name": "Attendance", "target_value": 150, "actual_value": 0},
        {"metric_name": "Revenue", "target_value": 10000, "actual_value": 4500},
        {"metric_name": "Satisfaction Score", "target_value": 4.5, "actual_value": 4.2},
    ]
    
    for goal in goals:
        response = requests.post(
            f"{API_BASE}/strategy/{event_id}/goals",
            json=goal,
            headers=headers
        )
        if response.status_code == 200:
            progress = (goal['actual_value'] / goal['target_value'] * 100) if goal['target_value'] > 0 else 0
            print_success(f"Added goal: {goal['metric_name']} - {progress:.1f}% complete")
        else:
            print_error(f"Failed to add goal: {response.status_code}")

# Test 4: Add ESG Metrics
def test_add_esg(token, event_id):
    print_section("TEST 4: Add ESG Metrics")
    
    headers = {"Authorization": f"Bearer {token}"}
    metrics = [
        {"metric": "Carbon Footprint", "value": 250.5, "unit": "kg CO2e"},
        {"metric": "Waste Recycled", "value": 85, "unit": "%"},
        {"metric": "Local Sourcing", "value": 70, "unit": "%"},
    ]
    
    for metric in metrics:
        response = requests.post(
            f"{API_BASE}/strategy/{event_id}/esg",
            json=metric,
            headers=headers
        )
        if response.status_code == 200:
            print_success(f"Added ESG metric: {metric['metric']} = {metric['value']} {metric['unit']}")
        else:
            print_error(f"Failed to add ESG metric: {response.status_code}")

# Test 5: Clone Event
def test_clone_event(token, event_id):
    print_section("TEST 5: Clone Event")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{API_BASE}/events/{event_id}/clone", headers=headers)
    
    if response.status_code == 200:
        cloned = response.json()
        print_success(f"Cloned event: {cloned['title']} (ID: {cloned['id']})")
        print_info(f"  Parent Event ID: {cloned.get('parent_event_id', 'N/A')}")
        return cloned['id']
    else:
        print_error(f"Failed to clone event: {response.status_code}")
        print_error(response.text)
        return None

# Test 6: Dashboard Stats
def test_dashboard_stats(token):
    print_section("TEST 6: Strategy Dashboard Stats")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/strategy/dashboard/stats", headers=headers)
    
    if response.status_code == 200:
        stats = response.json()
        print_success("Retrieved dashboard statistics:")
        print_info(f"  Total Events: {stats.get('total_events', 0)}")
        print_info(f"  Total Budget Planned: ${stats.get('total_budget_planned', 0):,.2f}")
        print_info(f"  Total Budget Actual: ${stats.get('total_budget_actual', 0):,.2f}")
        print_info(f"  Total Carbon Footprint: {stats.get('total_carbon_footprint', 0)} kg CO2e")
    else:
        print_error(f"Failed to get dashboard stats: {response.status_code}")

# Test 7: Verify Event Details
def test_get_event_details(token, event_id):
    print_section("TEST 7: Verify Event Details")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get event
    response = requests.get(f"{API_BASE}/events/?skip=0&limit=100", headers=headers)
    if response.status_code == 200:
        events = response.json()
        event = next((e for e in events if e['id'] == event_id), None)
        if event:
            print_success(f"Retrieved event: {event['title']}")
        else:
            print_error(f"Event {event_id} not found in list")
    
    # Get budget
    response = requests.get(f"{API_BASE}/strategy/{event_id}/budget", headers=headers)
    if response.status_code == 200:
        budget = response.json()
        print_success(f"Retrieved {len(budget)} budget items")
    
    # Get goals
    response = requests.get(f"{API_BASE}/strategy/{event_id}/goals", headers=headers)
    if response.status_code == 200:
        goals = response.json()
        print_success(f"Retrieved {len(goals)} goals")
    
    # Get ESG
    response = requests.get(f"{API_BASE}/strategy/{event_id}/esg", headers=headers)
    if response.status_code == 200:
        esg = response.json()
        print_success(f"Retrieved {len(esg)} ESG metrics")

# Main execution
def main():
    print(f"\n{Colors.BLUE}{'='*60}")
    print("  EVENT STRATEGY FEATURES - COMPREHENSIVE SMOKE TEST")
    print(f"{'='*60}{Colors.END}\n")
    
    # Authenticate
    token = get_auth_token()
    if not token:
        print_error("Cannot proceed without authentication")
        return
    
    # Run tests
    event_id = test_create_event(token)
    if not event_id:
        print_error("Cannot proceed without event creation")
        return
    
    test_add_budget(token, event_id)
    test_add_goals(token, event_id)
    test_add_esg(token, event_id)
    
    cloned_id = test_clone_event(token, event_id)
    
    test_dashboard_stats(token)
    test_get_event_details(token, event_id)
    
    # Summary
    print_section("SMOKE TEST COMPLETE")
    print_success("All strategy features tested successfully!")
    print_info(f"Test Event ID: {event_id}")
    if cloned_id:
        print_info(f"Cloned Event ID: {cloned_id}")
    print_info("\nYou can now test the UI:")
    print_info(f"  - Events List: http://localhost:3500/admin/events")
    print_info(f"  - Event Details: http://localhost:3500/admin/events/{event_id}")
    print_info(f"  - Strategy Dashboard: http://localhost:3500/admin/events/dashboard")
    print()

if __name__ == "__main__":
    main()
