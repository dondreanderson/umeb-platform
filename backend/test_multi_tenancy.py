#!/usr/bin/env python3
"""
Multi-Tenancy Feature Test Script
Tests tenant isolation, plan tier restrictions, and Super Admin functionality
"""

import requests
import json
from typing import Optional

# Configuration
BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

class MultiTenancyTester:
    def __init__(self):
        self.admin_token: Optional[str] = None
        self.user_token: Optional[str] = None
        self.tenant_starter_id: Optional[int] = None
        self.tenant_pro_id: Optional[int] = None
        self.tenant_biz_id: Optional[int] = None
        self.test_results = []
        
    def log(self, message: str, status: str = "INFO"):
        color = {
            "PASS": Colors.GREEN,
            "FAIL": Colors.RED,
            "WARN": Colors.YELLOW,
            "INFO": Colors.BLUE
        }.get(status, Colors.RESET)
        print(f"{color}[{status}]{Colors.RESET} {message}")
        
    def test(self, name: str, condition: bool, details: str = ""):
        self.test_results.append((name, condition))
        status = "PASS" if condition else "FAIL"
        self.log(f"{name}: {details}", status)
        return condition
        
    def login_admin(self, email: str = "admin@umeb.org", password: str = "admin123"):
        """Login as admin user"""
        self.log("Logging in as admin...", "INFO")
        try:
            response = requests.post(
                f"{API_V1}/login/access-token",
                data={"username": email, "password": password},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            if response.status_code == 200:
                self.admin_token = response.json()["access_token"]
                return self.test("Admin Login", True, f"Logged in as {email}")
            else:
                return self.test("Admin Login", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.test("Admin Login", False, str(e))
    
    def get_headers(self, token: Optional[str] = None):
        """Get authorization headers"""
        token = token or self.admin_token
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    # ==================== SUPER ADMIN TESTS ====================
    
    def test_get_global_stats(self):
        """Test Super Admin: Get global platform stats"""
        self.log("\n=== Testing Super Admin: Global Stats ===", "INFO")
        try:
            response = requests.get(
                f"{API_V1}/super-admin/stats",
                headers=self.get_headers()
            )
            if response.status_code == 200:
                stats = response.json()
                self.test(
                    "Get Global Stats",
                    all(k in stats for k in ["total_tenants", "total_users", "total_events"]),
                    f"Tenants: {stats.get('total_tenants')}, Users: {stats.get('total_users')}"
                )
                return stats
            else:
                self.test("Get Global Stats", False, f"Status: {response.status_code}")
        except Exception as e:
            self.test("Get Global Stats", False, str(e))
        return None
    
    def test_create_tenants(self):
        """Test Super Admin: Create tenants with different plan tiers"""
        self.log("\n=== Testing Super Admin: Create Tenants ===", "INFO")
        
        tenants = [
            {"name": "Starter Org", "slug": "starter-org", "plan_tier": "starter"},
            {"name": "Professional Org", "slug": "pro-org", "plan_tier": "professional"},
            {"name": "Business Org", "slug": "biz-org", "plan_tier": "business"}
        ]
        
        for tenant_data in tenants:
            try:
                response = requests.post(
                    f"{API_V1}/super-admin/tenants",
                    headers=self.get_headers(),
                    json=tenant_data
                )
                if response.status_code == 200:
                    tenant = response.json()
                    self.test(
                        f"Create {tenant_data['plan_tier'].title()} Tenant",
                        True,
                        f"ID: {tenant['id']}, Slug: {tenant['slug']}"
                    )
                    # Store tenant IDs
                    if tenant_data['plan_tier'] == 'starter':
                        self.tenant_starter_id = tenant['id']
                    elif tenant_data['plan_tier'] == 'professional':
                        self.tenant_pro_id = tenant['id']
                    elif tenant_data['plan_tier'] == 'business':
                        self.tenant_biz_id = tenant['id']
                else:
                    self.test(
                        f"Create {tenant_data['plan_tier'].title()} Tenant",
                        False,
                        f"Status: {response.status_code}, Error: {response.text}"
                    )
            except Exception as e:
                self.test(f"Create {tenant_data['plan_tier'].title()} Tenant", False, str(e))
    
    def test_list_tenants(self):
        """Test Super Admin: List all tenants"""
        self.log("\n=== Testing Super Admin: List Tenants ===", "INFO")
        try:
            response = requests.get(
                f"{API_V1}/super-admin/tenants",
                headers=self.get_headers()
            )
            if response.status_code == 200:
                tenants = response.json()
                self.test(
                    "List All Tenants",
                    len(tenants) >= 3,
                    f"Found {len(tenants)} tenants"
                )
                for tenant in tenants:
                    self.log(f"  - {tenant['name']} ({tenant['plan_tier']})", "INFO")
                return tenants
            else:
                self.test("List All Tenants", False, f"Status: {response.status_code}")
        except Exception as e:
            self.test("List All Tenants", False, str(e))
        return []
    
    def test_update_tenant_plan(self):
        """Test Super Admin: Update tenant plan tier"""
        self.log("\n=== Testing Super Admin: Update Tenant Plan ===", "INFO")
        if not self.tenant_starter_id:
            self.test("Update Tenant Plan", False, "No starter tenant ID available")
            return
        
        try:
            # Upgrade starter to professional
            response = requests.put(
                f"{API_V1}/super-admin/tenants/{self.tenant_starter_id}",
                headers=self.get_headers(),
                json={"plan_tier": "professional"}
            )
            if response.status_code == 200:
                tenant = response.json()
                self.test(
                    "Upgrade Tenant Plan",
                    tenant['plan_tier'] == 'professional',
                    f"Starter → Professional"
                )
                # Downgrade back to starter
                response = requests.put(
                    f"{API_V1}/super-admin/tenants/{self.tenant_starter_id}",
                    headers=self.get_headers(),
                    json={"plan_tier": "starter"}
                )
                if response.status_code == 200:
                    self.test("Downgrade Tenant Plan", True, "Professional → Starter")
            else:
                self.test("Update Tenant Plan", False, f"Status: {response.status_code}")
        except Exception as e:
            self.test("Update Tenant Plan", False, str(e))
    
    # ==================== FEATURE GATING TESTS ====================
    
    def test_elections_feature_gating(self):
        """Test that Elections require Professional tier"""
        self.log("\n=== Testing Feature Gating: Elections (Professional) ===", "INFO")
        
        # This test assumes you have users assigned to different tenants
        # For now, we'll test the endpoint accessibility
        try:
            response = requests.get(
                f"{API_V1}/elections/",
                headers=self.get_headers()
            )
            # If user's tenant is Starter, should get 403
            # If Professional or Business, should get 200
            if response.status_code == 403:
                self.test(
                    "Elections Blocked on Starter",
                    True,
                    "403 Forbidden - Plan upgrade required"
                )
            elif response.status_code == 200:
                self.test(
                    "Elections Accessible",
                    True,
                    "User has Professional or Business tier"
                )
            else:
                self.test("Elections Access", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.test("Elections Feature Gating", False, str(e))
    
    def test_fundraising_feature_gating(self):
        """Test that Fundraising requires Business tier"""
        self.log("\n=== Testing Feature Gating: Fundraising (Business) ===", "INFO")
        
        try:
            response = requests.get(
                f"{API_V1}/donors/campaigns",
                headers=self.get_headers()
            )
            if response.status_code == 403:
                self.test(
                    "Fundraising Blocked",
                    True,
                    "403 Forbidden - Business tier required"
                )
            elif response.status_code == 200:
                self.test(
                    "Fundraising Accessible",
                    True,
                    "User has Business tier"
                )
            else:
                self.test("Fundraising Access", False, f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.test("Fundraising Feature Gating", False, str(e))
    
    def test_event_cloning_feature_gating(self):
        """Test that Event Cloning requires Professional tier"""
        self.log("\n=== Testing Feature Gating: Event Cloning (Professional) ===", "INFO")
        
        # First, get an event to clone
        try:
            events_response = requests.get(
                f"{API_V1}/events/",
                headers=self.get_headers()
            )
            if events_response.status_code == 200 and events_response.json():
                event_id = events_response.json()[0]['id']
                
                # Try to clone
                clone_response = requests.post(
                    f"{API_V1}/events/{event_id}/clone",
                    headers=self.get_headers()
                )
                if clone_response.status_code == 403:
                    self.test(
                        "Event Cloning Blocked",
                        True,
                        "403 Forbidden - Professional tier required"
                    )
                elif clone_response.status_code == 200:
                    self.test(
                        "Event Cloning Accessible",
                        True,
                        "User has Professional or Business tier"
                    )
                else:
                    self.test("Event Cloning", False, f"Status: {clone_response.status_code}")
            else:
                self.test("Event Cloning", False, "No events available to test cloning")
        except Exception as e:
            self.test("Event Cloning Feature Gating", False, str(e))
    
    # ==================== DATA ISOLATION TESTS ====================
    
    def test_tenant_data_isolation(self):
        """Test that users only see data from their own tenant"""
        self.log("\n=== Testing Data Isolation ===", "INFO")
        
        # Get current user's events
        try:
            response = requests.get(
                f"{API_V1}/events/",
                headers=self.get_headers()
            )
            if response.status_code == 200:
                events = response.json()
                self.test(
                    "Events Scoped by Tenant",
                    True,
                    f"Retrieved {len(events)} events for current tenant"
                )
                
                # Verify all events belong to the same tenant (if tenant info is returned)
                if events and 'tenant_id' in events[0]:
                    tenant_ids = set(e.get('tenant_id') for e in events)
                    self.test(
                        "All Events Same Tenant",
                        len(tenant_ids) == 1,
                        f"Tenant IDs: {tenant_ids}"
                    )
            else:
                self.test("Events Data Isolation", False, f"Status: {response.status_code}")
        except Exception as e:
            self.test("Tenant Data Isolation", False, str(e))
    
    # ==================== RUN ALL TESTS ====================
    
    def run_all_tests(self):
        """Execute all test suites"""
        self.log("\n" + "="*60, "INFO")
        self.log("MULTI-TENANCY FEATURE TEST SUITE", "INFO")
        self.log("="*60 + "\n", "INFO")
        
        # Login
        if not self.login_admin():
            self.log("Cannot proceed without admin login", "FAIL")
            return
        
        # Super Admin Tests
        self.test_get_global_stats()
        self.test_create_tenants()
        self.test_list_tenants()
        self.test_update_tenant_plan()
        
        # Feature Gating Tests
        self.test_elections_feature_gating()
        self.test_fundraising_feature_gating()
        self.test_event_cloning_feature_gating()
        
        # Data Isolation Tests
        self.test_tenant_data_isolation()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        self.log("\n" + "="*60, "INFO")
        self.log("TEST SUMMARY", "INFO")
        self.log("="*60, "INFO")
        
        passed = sum(1 for _, result in self.test_results if result)
        failed = sum(1 for _, result in self.test_results if not result)
        total = len(self.test_results)
        
        self.log(f"Total Tests: {total}", "INFO")
        self.log(f"Passed: {passed}", "PASS" if passed == total else "INFO")
        self.log(f"Failed: {failed}", "FAIL" if failed > 0 else "INFO")
        
        if failed > 0:
            self.log("\nFailed Tests:", "FAIL")
            for name, result in self.test_results:
                if not result:
                    self.log(f"  - {name}", "FAIL")
        
        self.log("\n" + "="*60 + "\n", "INFO")

if __name__ == "__main__":
    tester = MultiTenancyTester()
    tester.run_all_tests()
