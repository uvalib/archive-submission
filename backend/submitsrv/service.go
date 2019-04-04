package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	dbx "github.com/go-ozzo/ozzo-dbx"
)

// ServiceContext contains the data
type ServiceContext struct {
	UploadDir   string
	DevAuthUser string
	DB          *dbx.DB
}

// Init will initialize the service context based on the config parameters
func (svc *ServiceContext) Init(cfg *ServiceConfig) {
	log.Printf("Initializing Service...")
	svc.UploadDir = cfg.UploadDir
	svc.DevAuthUser = cfg.DevAuthUser

	log.Printf("Init DB connection to %s...", cfg.DBHost)
	connectStr := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true", cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBName)
	db, err := dbx.Open("mysql", connectStr)
	if err != nil {
		log.Printf("FATAL: Unable to make connection: %s", err.Error())
		os.Exit(1)
	}
	svc.DB = db
}

// GetVersion reports the version of the serivce
func (svc *ServiceContext) GetVersion(c *gin.Context) {
	c.String(http.StatusOK, "Archives Transfer Service version %s", version)
}

// HealthCheck reports the health of the serivce
func (svc *ServiceContext) HealthCheck(c *gin.Context) {
	q := svc.DB.NewQuery("select version from versions order by created_at desc limit 1")
	var version string
	err := q.One(&version)
	if err != nil {
		// gin.H is a shortcut for map[string]interface{}
		c.JSON(http.StatusInternalServerError, gin.H{"alive": "true", "mysql": "false"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"alive": "true", "mysql": "true"})
}
